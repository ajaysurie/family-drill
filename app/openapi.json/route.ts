import { botTools } from "../../lib/bot-tools";
import { appBaseUrl } from "../../lib/email-assets";

export const dynamic = "force-static";
export function GET() {
  const paths = Object.fromEntries(botTools.map((tool) => [`/api/bot/tools/${tool.name}`, { post: {
    operationId: tool.name, summary: tool.title, description: tool.description,
    requestBody: { required: false, content: { "application/json": { schema: tool.inputSchema } } },
    responses: { 200: { description: "Success" }, 201: { description: "Created" }, 400: { description: "Invalid input, with a hint" }, 401: { description: "Missing or retired install code" }, 403: { description: "Household paused" }, 429: { description: "Rate limited" } },
  } }]));
  return Response.json({
    openapi: "3.1.0",
    info: { title: "Family Drill assistant API", version: "1.0.0", description: `Safe, fictional scam-practice drills for one household. Read ${appBaseUrl()}/agent.md before calling.` },
    servers: [{ url: appBaseUrl() }],
    security: [{ installCode: [] }],
    components: { securitySchemes: { installCode: { type: "http", scheme: "bearer", description: "The organizer's install code from /install." } } },
    paths,
  });
}
