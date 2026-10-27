import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { fetchClientMetadata, isMetadataClientId } from "./client-metadata";
import { db, ensureSchema } from "./db";
import { oauthClients, oauthCodes } from "./schema";
import { verifyInstall } from "./store";

// OAuth 2.1 for MCP connectors (Meta Muse, Claude, ChatGPT and others that sign in instead of
// taking a pasted secret). The access token it issues is the household's install code, so
// "Replace code" on the install page revokes every connected assistant at once.
export const OAUTH_SCOPE = "family-drill";
const CODE_TTL_MS = 10 * 60_000;
const BLOCKED_SCHEMES = new Set(["javascript:", "data:", "file:", "vbscript:", "about:"]);

export const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Protocol-Version, Mcp-Session-Id" };

export const authorizationServerMetadata = (base: string) => ({
  issuer: base,
  authorization_endpoint: `${base}/oauth/authorize`,
  token_endpoint: `${base}/oauth/token`,
  registration_endpoint: `${base}/oauth/register`,
  response_types_supported: ["code"],
  grant_types_supported: ["authorization_code"],
  code_challenge_methods_supported: ["S256"],
  token_endpoint_auth_methods_supported: ["none"],
  client_id_metadata_document_supported: true,
  scopes_supported: [OAUTH_SCOPE],
});

export const protectedResourceMetadata = (base: string) => ({ resource: `${base}/api/mcp`, resource_name: "Family Drill", authorization_servers: [base], scopes_supported: [OAUTH_SCOPE], bearer_methods_supported: ["header"] });

// Web clients must use HTTPS; localhost and native-app custom schemes are allowed.
export function isAllowedRedirect(uri: string) {
  try {
    const url = new URL(uri);
    if (url.protocol === "https:") return true;
    if (url.protocol === "http:") return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    return !BLOCKED_SCHEMES.has(url.protocol);
  } catch {
    return false;
  }
}

export const pkceChallenge = (verifier: string) => createHash("sha256").update(verifier).digest("base64url");

export async function registerClient(body: unknown) {
  const { client_name, redirect_uris } = (body ?? {}) as Record<string, unknown>;
  if (!Array.isArray(redirect_uris) || !redirect_uris.length || redirect_uris.some((uri) => typeof uri !== "string" || !isAllowedRedirect(uri))) return { error: "invalid_redirect_uri" } as const;
  const name = typeof client_name === "string" && client_name.trim() ? client_name.trim().slice(0, 100) : "An AI assistant";
  await ensureSchema();
  const [client] = await db.insert(oauthClients).values({ id: randomBytes(16).toString("hex"), name, redirectUris: JSON.stringify(redirect_uris) }).returning();
  return { client: { id: client.id, name: client.name, redirectUris: redirect_uris as string[] } } as const;
}

async function getClient(id: string) {
  await ensureSchema();
  if (isMetadataClientId(id)) {
    // Re-read the document on every sign-in so a changed name or redirect list takes effect; the
    // stored row only exists so codes can reference the client.
    const metadata = await fetchClientMetadata(id, isAllowedRedirect);
    if (!metadata) return;
    const values = { name: metadata.name, redirectUris: JSON.stringify(metadata.redirectUris) };
    await db.insert(oauthClients).values({ id, ...values }).onConflictDoUpdate({ target: oauthClients.id, set: values });
    return { id, ...metadata };
  }
  const [row] = await db.select().from(oauthClients).where(eq(oauthClients.id, id));
  return row && { id: row.id, name: row.name, redirectUris: JSON.parse(row.redirectUris) as string[] };
}

export type AuthorizeRequest = { clientId: string; clientName: string; redirectUri: string; state?: string; codeChallenge: string };

// Errors before the redirect URI is trusted are shown on our page; later ones go back to the client.
export async function parseAuthorizeRequest(params: Record<string, string | undefined>): Promise<{ request: AuthorizeRequest } | { error: string; redirect?: string }> {
  const client = params.client_id ? await getClient(params.client_id) : undefined;
  if (!client) return { error: params.client_id && isMetadataClientId(params.client_id) ? "Family Drill couldn't read this assistant's connection details. Try adding the connector again in a minute." : "This assistant isn't registered with Family Drill. Try adding the connector again." };
  const redirectUri = params.redirect_uri ?? (client.redirectUris.length === 1 ? client.redirectUris[0] : undefined);
  if (!redirectUri || !client.redirectUris.includes(redirectUri)) return { error: "The assistant sent a return address Family Drill doesn't recognize." };
  const back = (error: string) => { const url = new URL(redirectUri); url.searchParams.set("error", error); if (params.state) url.searchParams.set("state", params.state); return { error, redirect: url.toString() }; };
  if (params.response_type !== "code") return back("unsupported_response_type");
  if (!params.code_challenge || params.code_challenge_method !== "S256") return back("invalid_request");
  return { request: { clientId: client.id, clientName: client.name, redirectUri, state: params.state, codeChallenge: params.code_challenge } };
}

export async function issueCode(organizerId: string, request: AuthorizeRequest) {
  const install = await verifyInstall(organizerId);
  if (!install) return;
  const code = randomBytes(32).toString("base64url");
  await db.insert(oauthCodes).values({ code, clientId: request.clientId, organizerId, redirectUri: request.redirectUri, codeChallenge: request.codeChallenge, expiresAt: new Date(Date.now() + CODE_TTL_MS) });
  const url = new URL(request.redirectUri);
  url.searchParams.set("code", code);
  if (request.state) url.searchParams.set("state", request.state);
  return url.toString();
}

export async function exchangeCode(form: URLSearchParams) {
  if (form.get("grant_type") !== "authorization_code") return { error: "unsupported_grant_type" } as const;
  const code = form.get("code"), verifier = form.get("code_verifier");
  if (!code || !verifier) return { error: "invalid_request" } as const;
  await ensureSchema();
  // Marking the code used in the same statement that reads it makes a replayed code fail.
  const [row] = await db.update(oauthCodes).set({ usedAt: new Date() }).where(and(eq(oauthCodes.code, code), isNull(oauthCodes.usedAt), gt(oauthCodes.expiresAt, new Date()))).returning();
  if (!row) return { error: "invalid_grant" } as const;
  const clientId = form.get("client_id"), redirectUri = form.get("redirect_uri");
  if ((clientId && clientId !== row.clientId) || (redirectUri && redirectUri !== row.redirectUri) || pkceChallenge(verifier) !== row.codeChallenge) return { error: "invalid_grant" } as const;
  const install = await verifyInstall(row.organizerId);
  return install ? { token: { access_token: install.botToken, token_type: "Bearer", scope: OAUTH_SCOPE } } as const : { error: "invalid_grant" } as const;
}
