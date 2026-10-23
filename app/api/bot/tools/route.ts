import { botTools } from "../../../../lib/bot-tools";
export const dynamic = "force-static";
export function GET() { return Response.json({ tools: botTools.map(({ name, title, description, inputSchema, readOnly }) => ({ name, title, description, inputSchema, readOnly, call: `POST /api/bot/tools/${name}` })) }); }
