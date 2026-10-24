import { tokenFromRequest } from "../../../../lib/bot-auth";
import { handleMcpRequest, mcpMethodNotAllowed, mcpPreflight } from "../../../../lib/mcp";

// Some assistants can only store a connector URL, so the install code may travel in the path.
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  return handleMcpRequest(request, tokenFromRequest(request) ?? (await params).token);
}
export const GET = mcpMethodNotAllowed;
export const DELETE = mcpMethodNotAllowed;
export const OPTIONS = mcpPreflight;
