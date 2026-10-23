import { appBaseUrl } from "../../lib/email-assets";

export const dynamic = "force-static";
export function GET() {
  const url = appBaseUrl();
  return new Response(`# Family Drill

> Safe, surprise scam-practice emails for families, run from an AI assistant. Every sender is fictional, nothing is collected, and every click opens a short lesson.

- [Assistant guide](${url}/agent.md): how an AI assistant connects (MCP or HTTPS), sets up a household, and coaches the family.
- [OpenAPI spec](${url}/openapi.json): the same tools as plain HTTPS endpoints.
- [MCP endpoint](${url}/api/mcp): Streamable HTTP, bearer install code.
- [Teach your family](${url}/learn): the 4-question scam check and conversation tips.
- [Practice emails](${url}/examples): every fictional scenario.
- [Safety rules](${url}/docs/safety)
`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
