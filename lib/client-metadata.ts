import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// OAuth Client ID Metadata Documents: an assistant may use an HTTPS URL as its client_id and host
// its name and redirect URIs there, instead of registering first. This is the registration method
// the MCP spec prefers, so connectors that skip dynamic registration still work.
export type ClientMetadata = { name: string; redirectUris: string[] };

const MAX_BYTES = 16_384;
const TIMEOUT_MS = 5_000;

export function isMetadataClientId(clientId: string) {
  try {
    const url = new URL(clientId);
    return url.protocol === "https:" && url.pathname !== "/" && !url.username && !url.password && !url.hash;
  } catch {
    return false;
  }
}

// Loopback, private, link-local, CGNAT and unique-local ranges. Fetching the document must never
// let a stranger make this server call into its own network.
export function isPublicAddress(ip: string) {
  const v4 = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  if (isIP(v4) === 4) {
    const [a, b] = v4.split(".").map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168));
  }
  const lower = ip.toLowerCase();
  return isIP(lower) === 6 && lower !== "::" && lower !== "::1" && !/^f[cd]/.test(lower) && !/^fe[89ab]/.test(lower);
}

export function parseClientMetadata(clientId: string, document: unknown, isAllowedRedirect: (uri: string) => boolean): ClientMetadata | undefined {
  const { client_id, client_name, redirect_uris } = (document ?? {}) as Record<string, unknown>;
  if (client_id !== clientId) return;
  if (!Array.isArray(redirect_uris) || !redirect_uris.length || redirect_uris.some((uri) => typeof uri !== "string" || !isAllowedRedirect(uri))) return;
  const name = typeof client_name === "string" && client_name.trim() ? client_name.trim().slice(0, 100) : new URL(clientId).hostname;
  return { name, redirectUris: redirect_uris as string[] };
}

export async function fetchClientMetadata(clientId: string, isAllowedRedirect: (uri: string) => boolean) {
  if (!isMetadataClientId(clientId)) return;
  const { hostname } = new URL(clientId);
  const addresses = await lookup(hostname.replace(/^\[|\]$/g, ""), { all: true }).catch(() => []);
  if (!addresses.length || !addresses.every(({ address }) => isPublicAddress(address))) return;
  try {
    const response = await fetch(clientId, { redirect: "error", signal: AbortSignal.timeout(TIMEOUT_MS), headers: { Accept: "application/json" } });
    if (!response.ok || Number(response.headers.get("content-length") ?? 0) > MAX_BYTES) return;
    const body = await response.text();
    if (body.length > MAX_BYTES) return;
    return parseClientMetadata(clientId, JSON.parse(body), isAllowedRedirect);
  } catch {
    return;
  }
}
