import { categoryLabels, isValidTimeZone, QUIET_HOURS } from "./drill-planning";
import { addMember, allCategories, canOperate, createBotDrill, deleteMember, getBotEvents, getDrillPreferences, getFamilyReport, getHousehold, getMembers, isPaused, listDrills, recordReport, scenarios, sendHeadsUp, setDrillPreferences, setPaused, updateMember, type DrillRequestError } from "./store";
import type { ScenarioCategory } from "./types";

// One registry backs both the MCP server and the REST routes, so every assistant
// (Grok Bot, Meta Muse, or a hand-written script) gets the same rules and errors.
type Input = Record<string, unknown>;
export type ToolResult = { status: number; body: unknown };
type JsonSchema = { type: "object"; properties: Record<string, unknown>; required?: string[]; additionalProperties: false };
export type BotTool = { name: string; title: string; description: string; inputSchema: JsonSchema; readOnly: boolean; run(organizerId: string, input: Input): Promise<ToolResult> };

const ok = (body: unknown, status = 200): ToolResult => ({ status, body });
const fail = (status: number, error: string, hint?: string): ToolResult => ({ status, body: { error, ...(hint && { hint }) } });
const schema = (properties: Record<string, unknown> = {}, required: string[] = []): JsonSchema => ({ type: "object", properties, ...(required.length && { required }), additionalProperties: false });
const text = (description: string) => ({ type: "string", description });
const optionalString = (input: Input, key: string) => input[key] === undefined || input[key] === null ? undefined : typeof input[key] === "string" ? input[key] as string : null;
const paused = () => fail(403, "household_paused_or_inactive", "Drills are paused or the household agreement is inactive. Ask the organizer whether to resume with resume_drills.");

const drillErrors: Record<DrillRequestError, [number, string]> = {
  install_inactive_or_paused: [403, "Drills are paused or the agreement is inactive. Ask the organizer before calling resume_drills."],
  rate_limited: [429, "At most five drills per household per hour. Space drills out; one every week or two per person works best."],
  member_not_found: [400, "Call list_members to get a valid memberId."],
  everyone_recently_drilled: [429, "Everyone got a drill in the last 12 hours. Try again tomorrow, or name a memberId if the organizer insists."],
  no_members: [400, "Add a family member first with add_member."],
  no_enabled_categories: [400, "Every topic is turned off. Turn some on with update_preferences."],
  scenario_not_found: [400, "Call list_scenarios for valid ids, or use \"surprise\"."],
  scenario_disabled: [400, "That topic is turned off for this household. Pick another scenario or ask the organizer to enable it."],
  invalid_send_at: [400, "sendAt must be an ISO 8601 date-time such as 2026-11-03T15:30:00Z."],
  send_at_too_far: [400, "sendAt must be within the next 72 hours. For later drills, use your own reminder or routine and call send_drill then."],
  delivery_failed: [502, "The email provider rejected the message. Check the address with the organizer, then try again later."],
};

const nextSteps = async (organizerId: string) => {
  const [members, preferences] = await Promise.all([getMembers(organizerId), getDrillPreferences(organizerId)]);
  return [
    !preferences.organizerName && "Ask the organizer for their first name and save it with update_preferences (organizerName). It appears in the heads-up email.",
    !preferences.timeZone && "Ask which time zone the family lives in and save it with update_preferences (timeZone). Quiet hours use it.",
    !members.length && "Ask who to add. For each relative, collect a first name and email address, then call add_member.",
    members.length > 0 && "Offer to send the first surprise drill with send_drill. Suggest spacing drills one to two weeks apart per person.",
  ].filter(Boolean);
};

export const botTools: BotTool[] = [
  { name: "get_status", title: "Check setup", readOnly: true, description: "Start here. Returns whether drills can run, the household's settings, member count, and suggested next steps for setup.", inputSchema: schema(), async run(organizerId) {
    const [household, members, preferences, operating, householdPaused] = await Promise.all([getHousehold(organizerId), getMembers(organizerId), getDrillPreferences(organizerId), canOperate(organizerId), isPaused(organizerId)]);
    return ok({ ready: operating, householdPaused, agreement: household?.status ?? "missing", organizerName: preferences.organizerName, timeZone: preferences.timeZone, quietHours: `${QUIET_HOURS.start}:00-${QUIET_HOURS.end}:00 household time`, memberCount: members.length, enabledCategories: preferences.enabledCategories, nextSteps: await nextSteps(organizerId) });
  } },
  { name: "list_members", title: "List family members", readOnly: true, description: "List the household members who can receive practice emails.", inputSchema: schema(), async run(organizerId) {
    return ok({ members: (await getMembers(organizerId)).map(({ id, name, email }) => ({ id, name, email })) });
  } },
  { name: "add_member", title: "Add a family member", readOnly: false, description: "Add a relative who agreed to receive practice emails. Ask the organizer before setting sendHeadsUp: the heads-up email tells the relative practice emails are coming, which is recommended so nobody is alarmed.", inputSchema: schema({ name: text("First name the emails should use, such as \"Ruth\"."), email: text("Their email address."), sendHeadsUp: { type: "boolean", description: "Send a friendly email explaining Family Drill and the 4-question scam check. Recommended." } }, ["name", "email"]), async run(organizerId, input) {
    if (!await canOperate(organizerId)) return paused();
    if (typeof input.name !== "string" || !input.name.trim() || typeof input.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return fail(400, "invalid_member", "Provide a first name and a valid email address.");
    if ((await getMembers(organizerId)).some((member) => member.email === (input.email as string).trim().toLowerCase())) return fail(409, "member_exists", "That email is already in the household. Use list_members.");
    const member = await addMember(organizerId, input.name, input.email);
    if (!member) return fail(404, "household_not_found");
    const headsUpSent = input.sendHeadsUp === true && await sendHeadsUp(organizerId, member.id);
    return ok({ member: { id: member.id, name: member.name, email: member.email }, headsUpSent }, 201);
  } },
  { name: "update_member", title: "Update a family member", readOnly: false, description: "Change a member's name or email.", inputSchema: schema({ memberId: text("Member id from list_members."), name: text("New first name."), email: text("New email address.") }, ["memberId"]), async run(organizerId, input) {
    if (!await canOperate(organizerId)) return paused();
    const name = optionalString(input, "name"), email = optionalString(input, "email");
    if (typeof input.memberId !== "string" || name === null || email === null || (email !== undefined && !email.includes("@"))) return fail(400, "invalid_member");
    const member = await updateMember(organizerId, input.memberId, { name, email });
    return member ? ok({ member: { id: member.id, name: member.name, email: member.email } }) : fail(404, "member_not_found", "Call list_members to get a valid memberId.");
  } },
  { name: "remove_member", title: "Remove a family member", readOnly: false, description: "Remove a member and their drill history. Do this right away if anyone asks to stop receiving practice emails.", inputSchema: schema({ memberId: text("Member id from list_members.") }, ["memberId"]), async run(organizerId, input) {
    if (!await canOperate(organizerId)) return paused();
    if (typeof input.memberId !== "string") return fail(400, "invalid_member");
    return await deleteMember(organizerId, input.memberId) ? ok({ removed: true }) : fail(404, "member_not_found");
  } },
  { name: "get_preferences", title: "Read drill settings", readOnly: true, description: "Read enabled topics, time zone, organizer name, and the SMS preview setting.", inputSchema: schema(), async run(organizerId) {
    return ok(await getDrillPreferences(organizerId));
  } },
  { name: "update_preferences", title: "Change drill settings", readOnly: false, description: `Change any of: enabledCategories (${allCategories.join(", ")}), timeZone (IANA name like America/Chicago), organizerName (the organizer's first name), smsPreview.`, inputSchema: schema({ enabledCategories: { type: "array", items: { type: "string", enum: allCategories }, description: "Topics drills may use." }, timeZone: text("IANA time zone such as America/New_York."), organizerName: text("Organizer's first name, used in heads-up emails."), smsPreview: { type: "boolean" } }), async run(organizerId, input) {
    const { enabledCategories, timeZone, organizerName, smsPreview } = input;
    if (enabledCategories !== undefined && (!Array.isArray(enabledCategories) || enabledCategories.some((value) => !allCategories.includes(value as ScenarioCategory)))) return fail(400, "invalid_preferences", `enabledCategories must only contain: ${allCategories.join(", ")}.`);
    if (timeZone !== undefined && (typeof timeZone !== "string" || !isValidTimeZone(timeZone))) return fail(400, "invalid_preferences", "timeZone must be an IANA name such as America/Los_Angeles.");
    if ((organizerName !== undefined && typeof organizerName !== "string") || (smsPreview !== undefined && typeof smsPreview !== "boolean")) return fail(400, "invalid_preferences");
    return ok(await setDrillPreferences(organizerId, { enabledCategories: enabledCategories as ScenarioCategory[] | undefined, timeZone: timeZone as string | undefined, organizerName: organizerName as string | undefined, smsPreview: smsPreview as boolean | undefined }));
  } },
  { name: "list_scenarios", title: "List practice emails", readOnly: true, description: "List the fictional practice emails available. Each one copies a real scam tactic using an invented company.", inputSchema: schema(), async run(organizerId) {
    const { enabledCategories } = await getDrillPreferences(organizerId);
    return ok({ scenarios: scenarios.map((scenario) => ({ id: scenario.id, category: scenario.category, topic: categoryLabels[scenario.category], from: scenario.fromName, subject: scenario.subject, tactic: scenario.lesson[0], enabled: enabledCategories.includes(scenario.category) })) });
  } },
  { name: "send_drill", title: "Send a practice email", readOnly: false, description: "Send one surprise practice email. Omit memberId to pick whoever is due, and omit scenarioId to pick a lure they haven't seen. Never tell the recipient in advance which email or when. Quiet hours move late-night sends to 8:00 household time.", inputSchema: schema({ memberId: text("Optional member id from list_members."), scenarioId: text("Optional scenario id from list_scenarios, or \"surprise\"."), sendAt: text("Optional ISO 8601 time within 72 hours.") }), async run(organizerId, input) {
    const memberId = optionalString(input, "memberId"), scenarioId = optionalString(input, "scenarioId"), sendAt = optionalString(input, "sendAt");
    if (memberId === null || scenarioId === null || sendAt === null) return fail(400, "invalid_request", "memberId, scenarioId, and sendAt must be strings.");
    const result = await createBotDrill(organizerId, memberId, scenarioId, sendAt);
    if ("error" in result) { const [status, hint] = drillErrors[result.error]; return fail(status, result.error, hint); }
    return ok({ drillId: result.attempt.id, memberId: result.member.id, memberName: result.member.name, scenarioId: result.scenario.id, scenarioLabel: result.scenario.subject, from: result.scenario.fromName, revealPath: `/d/${result.attempt.drillToken}`, scheduledFor: result.attempt.scheduledFor }, 201);
  } },
  { name: "list_drills", title: "List drills and outcomes", readOnly: true, description: "List drills newest first with their outcome: scheduled, sent, clicked, entered-details, reported, or failed.", inputSchema: schema({ memberId: text("Optional member id to filter by.") }), async run(organizerId, input) {
    return ok({ drills: await listDrills(organizerId, typeof input.memberId === "string" ? input.memberId : undefined) });
  } },
  { name: "get_drill", title: "Get coaching for a drill", readOnly: true, description: "Get one drill's outcome plus the clues and a short, kind coaching script the organizer can use with that relative.", inputSchema: schema({ drillId: text("Drill id from send_drill or list_drills.") }, ["drillId"]), async run(organizerId, input) {
    if (typeof input.drillId !== "string") return fail(400, "invalid_request");
    const drill = (await listDrills(organizerId)).find((item) => item.drillId === input.drillId);
    if (!drill) return fail(404, "drill_not_found");
    const scenario = scenarios.find((item) => item.id === drill.scenarioId)!;
    const script = drill.reported && !drill.clicked ? `Great catch, ${drill.memberName}! You spotted the ${scenario.fromName} email and told me. That's exactly what to do with a real one.` : drill.clicked ? `Hey ${drill.memberName}, that ${scenario.fromName} email was one of our practice ones. No harm done. The giveaways were: ${scenario.clues.map((clue) => clue.label.toLowerCase()).join("; ")}. Next time, pause and check with me first.` : `No click yet on the ${scenario.fromName} email. Don't mention it until a few days have passed.`;
    return ok({ ...drill, lessonBullets: scenario.lesson, clues: scenario.clues, coachingScript: script, lureDeliberate: drill.confirmedByMember, lureEngagementMethod: drill.confirmedByMember ? "explicit_button" : null });
  } },
  { name: "record_report", title: "Record that someone reported a drill", readOnly: false, description: "Call when the organizer says a relative spotted a practice email and told them (or forwarded it) instead of clicking. This is the win to celebrate.", inputSchema: schema({ drillId: text("Drill id from list_drills. Use the member's most recent drill if unsure.") }, ["drillId"]), async run(organizerId, input) {
    if (typeof input.drillId !== "string") return fail(400, "invalid_request");
    return await recordReport(organizerId, input.drillId) ? ok({ recorded: true }) : fail(404, "drill_not_found");
  } },
  { name: "get_family_report", title: "Family scoreboard", readOnly: true, description: "Per-member totals of drills sent, clicked, details entered, and reported, plus each person's latest drill. Use it for a friendly weekly recap.", inputSchema: schema(), async run(organizerId) {
    return ok({ members: await getFamilyReport(organizerId) });
  } },
  { name: "list_events", title: "Read recent activity", readOnly: true, description: "Activity feed, oldest first. Pass the last cursor as since to get only new events. drill.revealed means the person clicked through to the lesson page.", inputSchema: schema({ since: text("Cursor from a previous event, or an ISO date.") }), async run(organizerId, input) {
    return ok({ events: await getBotEvents(organizerId, typeof input.since === "string" ? input.since : undefined) });
  } },
  { name: "pause_drills", title: "Pause all drills", readOnly: false, description: "Stop all new drills for the household. Use immediately if any member asks to stop.", inputSchema: schema(), async run(organizerId) {
    return ok({ paused: Boolean((await setPaused(organizerId, true))?.householdPaused) });
  } },
  { name: "resume_drills", title: "Resume drills", readOnly: false, description: "Resume drills after a pause. Only do this when the organizer asks.", inputSchema: schema(), async run(organizerId) {
    return ok({ paused: Boolean((await setPaused(organizerId, false))?.householdPaused) });
  } },
];

export async function callBotTool(name: string, organizerId: string, input: unknown): Promise<ToolResult> {
  const tool = botTools.find((item) => item.name === name);
  if (!tool) return fail(404, "unknown_tool");
  if (input !== undefined && input !== null && (typeof input !== "object" || Array.isArray(input))) return fail(400, "invalid_request", "Arguments must be a JSON object.");
  return tool.run(organizerId, (input ?? {}) as Input);
}

export async function runBotTool(name: string, organizerId: string, input: unknown) {
  const { status, body } = await callBotTool(name, organizerId, input);
  return Response.json(body, { status });
}
