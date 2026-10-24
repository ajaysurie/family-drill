import { corsHeaders, exchangeCode } from "../../../lib/oauth";

export async function POST(request: Request) {
  const type = request.headers.get("content-type") ?? "";
  const form = type.includes("application/json") ? new URLSearchParams(await request.json().catch(() => ({}))) : new URLSearchParams(await request.text());
  const result = await exchangeCode(form);
  if ("error" in result) return Response.json({ error: result.error }, { status: 400, headers: { ...corsHeaders, "Cache-Control": "no-store" } });
  return Response.json(result.token, { headers: { ...corsHeaders, "Cache-Control": "no-store" } });
}
export const OPTIONS = () => new Response(null, { status: 204, headers: corsHeaders });
