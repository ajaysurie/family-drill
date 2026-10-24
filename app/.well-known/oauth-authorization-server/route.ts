import { appBaseUrl } from "../../../lib/email-assets";
import { authorizationServerMetadata, corsHeaders } from "../../../lib/oauth";

export const dynamic = "force-static";
export const GET = () => Response.json(authorizationServerMetadata(appBaseUrl()), { headers: corsHeaders });
export const OPTIONS = () => new Response(null, { status: 204, headers: corsHeaders });
