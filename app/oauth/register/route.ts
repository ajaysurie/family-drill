import { corsHeaders, registerClient } from "../../../lib/oauth";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "invalid_client_metadata" }, { status: 400, headers: corsHeaders }); }
  const result = await registerClient(body);
  if ("error" in result) return Response.json({ error: result.error, error_description: "Redirect URIs must be HTTPS, localhost, or an app's own scheme." }, { status: 400, headers: corsHeaders });
  const { client } = result;
  return Response.json({ client_id: client.id, client_name: client.name, redirect_uris: client.redirectUris, token_endpoint_auth_method: "none", grant_types: ["authorization_code"], response_types: ["code"] }, { status: 201, headers: corsHeaders });
}
export const OPTIONS = () => new Response(null, { status: 204, headers: corsHeaders });
