import { agentGuide } from "../../lib/agent-guide";
import { appBaseUrl } from "../../lib/email-assets";

export const dynamic = "force-static";
export function GET() { return new Response(agentGuide(appBaseUrl()), { headers: { "Content-Type": "text/markdown; charset=utf-8" } }); }
