import { tokenFromRequest } from "../../../lib/bot-auth";
import { handleMcpRequest, mcpMethodNotAllowed, mcpPreflight } from "../../../lib/mcp";

export const POST = (request: Request) => handleMcpRequest(request, tokenFromRequest(request));
export const GET = mcpMethodNotAllowed;
export const DELETE = mcpMethodNotAllowed;
export const OPTIONS = mcpPreflight;
