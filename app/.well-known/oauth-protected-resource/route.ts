import { appBaseUrl } from "../../../lib/email-assets";
import { corsHeaders, protectedResourceMetadata } from "../../../lib/oauth";

export const dynamic = "force-static";
export const GET = () => Response.json(protectedResourceMetadata(appBaseUrl()), { headers: corsHeaders });
export const OPTIONS = () => new Response(null, { status: 204, headers: corsHeaders });
