import { categoryLabels, isValidTimeZone, MAX_MEMBERS, QUIET_HOURS } from "./drill-planning";
import { addMember, allCategories, canOperate, cancelScheduledDrills, createBotDrill, deleteMember, getBotEvents, getDrillPreferences, getFamilyReport, getMembers, isPaused, listDrills, recordReport, scenarios, sendHeadsUp, setDrillPreferences, setPaused, updateMember, type DrillRequestError } from "./store";
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
  rate_limited: [429, "A household can send at most five drills per hour. One drill per person every week or two works best."],
  member_not_found: [400, "Call list_members to get a valid memberId."],
  member_opted_out: [403, "This person asked to stop receiving practice emails. Only turn drills back on with update_member if they say so themselves."],
  everyone_recently_drilled: [429, "Everyone got a drill in the last 12 hours. Try again tomorrow, or name a memberId if the organizer insists."],
  no_members: [400, "No one is set to receive drills. Add a family member with add_member."],
  no_enabled_categories: [400, "Every topic is turned off. Turn some on with update_preferences."],
  scenario_not_found: [400, "Call list_scenarios for valid ids, or use \"surprise\"."],
  scenario_disabled: [400, "That topic is turned off for this household. Pick another scenario or ask the organizer to enable it."],
  invalid_send_at: [400, "sendAt must be an ISO 8601 date-time with Z or an offset, such as 2026-11-03T15:30:00Z or 2026-11-03T09:30:00-06:00."],
  send_at_too_far: [400, "sendAt must be within the next 72 hours. For later drills, use your own reminder or routine and call send_drill then."],
  delivery_failed: [502, "The email provider rejected the message. Check the address with the organizer, then try again later."],
};

const nextSteps = async (organizerId: string) => {
  const [members, preferences, drills] = await Promise.all([getMembers(organizerId), getDrillPreferences(organizerId), listDrills(organizerId)]);
  const receiving = members.filter((member) => member.receivingDrills);
  return [
    !preferences.organizerName && "Ask the organizer for their first name and save it as organizerName with update_preferences. It appears in the heads-up email.",
    !preferences.timeZone && "Ask which time zone the family lives in and save it as timeZone with update_preferences. Quiet hours use it.",
    !receiving.length && "Ask who to add. For each relative, collect a first name and email address, confirm they agreed or will be told, then call add_member. Recommend sendHeadsUp.",
    receiving.length > 0 && !drills.length && preferences.enabledCategories.length === allCategories.length && "Offer the topics from list_scenarios and ask whether any should be turned off.",
    receiving.length > 0 && !drills.length && "Offer to schedule the first surprise drill with send_drill and a sendAt one or two days from now, so the heads-up email arrives well before it.",
    drills.length > 0 && "Drills are running. Suggest about one per person every week or two, at varied times.",
  ].filter(Boolean);
};

export const botTools: BotTool[] = [
  { name: "get_status", title: "Check setup", readOnly: true, description: "Start here. Returns whether drills can run, the household's settings, member count, and suggested next steps for setup.", inputSchema: schema(), async run(organizerId) {
    const operating = await canOperate(organizerId);
    const [members, preferences, householdPaused] = await Promise.all([getMembers(organizerId), getDrillPreferences(organizerId), isPaused(organizerId)]);
    const receiving = members.filter((member) => member.receivingDrills).length;
    return ok({ canSendDrills: operating && receiving > 0, householdPaused, organizerName: preferences.organizerName, timeZone: preferences.timeZone, quietHours: `${QUIET_HOURS.start}:00-${QUIET_HOURS.end}:00 household time`, memberCount: members.length, receivingDrills: receiving, enabledCategories: preferences.enabledCategories, nextSteps: await nextSteps(organizerId) });
  } },
  { name: "list_members", title: "List family members", readOnly: true, description: "List household members. receivingDrills is false for anyone who asked to stop.", inputSchema: schema(), async run(organizerId) {
    return ok({ members: (await getMembers(organizerId)).map(({ id, name, email, receivingDrills }) => ({ id, name, email, receivingDrills })) });
  } },
  { name: "add_member", title: "Add a family member", readOnly: false, description: "Add a relative who agreed to receive practice emails. Ask the organizer before setting sendHeadsUp. We recommend it, because the heads-up email tells the relative that practice emails are coming, so nobody gets alarmed.", inputSchema: schema({ name: text("First name the emails should use, such as \"Ruth\"."), email: text("Their email address."), sendHeadsUp: { type: "boolean", description: "Send a friendly email that explains Family Drill and the 4-question scam check. We recommend it." } }, ["name", "email"]), async run(organizerId, input) {
    if (!await canOperate(organizerId)) return paused();
    if (typeof input.name !== "string" || !input.name.trim() || typeof input.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return fail(400, "invalid_member", "Provide a first name and a valid email address.");
    const existing = await getMembers(organizerId);
    if (existing.some((member) => member.email === (input.email as string).trim().toLowerCase())) return fail(409, "member_exists", "That email is already in the household. Use list_members.");
    if (existing.length >= MAX_MEMBERS) return fail(403, "household_full", `A household can have up to ${MAX_MEMBERS} members. Family Drill is for one family, not groups or workplaces.`);
    const member = await addMember(organizerId, input.name, input.email);
    if (!member) return fail(404, "household_not_found");
    const headsUpSent = input.sendHeadsUp === true && await sendHeadsUp(organizerId, member.id);
    return ok({ member: { id: member.id, name: member.name, email: member.email }, headsUpSent }, 201);
  } },
  { name: "update_member", title: "Update a family member", readOnly: false, description: "Change a member's name or email, or stop and restart their drills. Set receivingDrills to false right away when someone asks to stop. That also cancels any drill already scheduled for them and keeps their history. Set it back to true only if they ask.", inputSchema: schema({ memberId: text("Member id from list_members."), name: text("New first name."), email: text("New email address."), receivingDrills: { type: "boolean", description: "false stops drills for this person and keeps their history." } }, ["memberId"]), async run(organizerId, input) {
    const name = optionalString(input, "name"), email = optionalString(input, "email"), receivingDrills = input.receivingDrills;
    if (typeof input.memberId !== "string" || name === null || email === null || (email !== undefined && !email.includes("@")) || (receivingDrills !== undefined && typeof receivingDrills !== "boolean")) return fail(400, "invalid_member");
    // Stopping someone's drills must work even while the household is paused.
    if (receivingDrills !== false && !await canOperate(organizerId)) return paused();
    const member = await updateMember(organizerId, input.memberId, { name, email, receivingDrills: receivingDrills as boolean | undefined });
    if (!member) return fail(404, "member_not_found", "Call list_members to get a valid memberId.");
    const cancelledDrills = receivingDrills === false ? await cancelScheduledDrills(organizerId, { memberId: member.id }) : [];
    return ok({ member: { id: member.id, name: member.name, email: member.email, receivingDrills: !member.optedOutAt }, cancelledDrills });
  } },
  { name: "remove_member", title: "Remove a family member", readOnly: false, description: "Delete a member and all their drill history. To stop someone's drills and keep their history, use update_member with receivingDrills false instead.", inputSchema: schema({ memberId: text("Member id from list_members.") }, ["memberId"]), async run(organizerId, input) {
    if (typeof input.memberId !== "string") return fail(400, "invalid_member");
    return await deleteMember(organizerId, input.memberId) ? ok({ removed: true }) : fail(404, "member_not_found");
  } },
  { name: "get_preferences", title: "Read drill settings", readOnly: true, description: "Read enabled topics, time zone, organizer name, and the SMS preview setting.", inputSchema: schema(), async run(organizerId) {
    return ok(await getDrillPreferences(organizerId));
  } },
  { name: "update_preferences", title: "Change drill settings", readOnly: false, description: `Change any of these settings. enabledCategories is the full list of topics to allow and replaces the current list. It takes any of ${allCategories.join(", ")}. timeZone takes an IANA name such as America/Chicago. organizerName is the organizer's first name. smsPreview turns on a text-message preview in the web dashboard. It never sends texts.`, inputSchema: schema({ enabledCategories: { type: "array", items: { type: "string", enum: allCategories }, description: "Topics drills may use." }, timeZone: text("IANA time zone such as America/New_York."), organizerName: text("Organizer's first name, used in heads-up emails."), smsPreview: { type: "boolean" } }), async run(organizerId, input) {
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
  { name: "send_drill", title: "Send a practice email", readOnly: false, description: "Send one surprise practice email. Omit memberId to pick the person with the fewest drills, skipping anyone who got one in the last 12 hours or asked to stop, and omit scenarioId to pick a lure they haven't seen. \"surprise\" means the same as omitting it. Never tell the recipient in advance which email or when. Quiet hours move late-night sends to 8:00 household time.", inputSchema: schema({ memberId: text("Optional member id from list_members."), scenarioId: text("Optional scenario id from list_scenarios, or \"surprise\"."), sendAt: text("Optional ISO 8601 time within 72 hours.") }), async run(organizerId, input) {
    const memberId = optionalString(input, "memberId"), scenarioId = optionalString(input, "scenarioId"), sendAt = optionalString(input, "sendAt");
    if (memberId === null || scenarioId === null || sendAt === null) return fail(400, "invalid_request", "memberId, scenarioId, and sendAt must be strings.");
    const result = await createBotDrill(organizerId, memberId, scenarioId, sendAt);
    if ("error" in result) { const [status, hint] = drillErrors[result.error]; return fail(status, result.error, hint); }
    return ok({ drillId: result.attempt.id, memberId: result.member.id, memberName: result.member.name, scenarioId: result.scenario.id, scenarioLabel: result.scenario.subject, from: result.scenario.fromName, revealPath: `/d/${result.attempt.drillToken}`, scheduledFor: result.attempt.scheduledFor }, 201);
  } },
  { name: "cancel_drill", title: "Cancel a scheduled drill", readOnly: false, description: "Cancel a drill that hasn't been delivered yet. Drills already delivered can't be recalled.", inputSchema: schema({ drillId: text("Drill id from send_drill or list_drills.") }, ["drillId"]), async run(organizerId, input) {
    if (typeof input.drillId !== "string") return fail(400, "invalid_request");
    const cancelled = await cancelScheduledDrills(organizerId, { drillId: input.drillId });
    return cancelled.length ? ok({ cancelled: true }) : fail(409, "not_cancellable", "Only drills whose outcome is scheduled can be cancelled. Check list_drills.");
  } },
  { name: "list_drills", title: "List drills and outcomes", readOnly: true, description: "List drills newest first with their outcome: scheduled, sent, clicked, entered-details, reported, cancelled, or failed. createdAt is when the drill was queued; scheduledFor is when it sends.", inputSchema: schema({ memberId: text("Optional member id to filter by.") }), async run(organizerId, input) {
    return ok({ drills: await listDrills(organizerId, typeof input.memberId === "string" ? input.memberId : undefined) });
  } },
  { name: "get_drill", title: "Get coaching for a drill", readOnly: true, description: "Get one drill's outcome, its clues, and a short, kind coaching script for the organizer. clicked means the lesson page opened in a browser. confirmedByMember means the person pressed the button saying they clicked. enteredDetails means they pressed Sign in on a practice page. lureDeliberate and lureEngagementMethod repeat confirmedByMember for older bots.", inputSchema: schema({ drillId: text("Drill id from send_drill or list_drills.") }, ["drillId"]), async run(organizerId, input) {
    if (typeof input.drillId !== "string") return fail(400, "invalid_request");
    const drill = (await listDrills(organizerId)).find((item) => item.drillId === input.drillId);
    if (!drill) return fail(404, "drill_not_found");
    const scenario = scenarios.find((item) => item.id === drill.scenarioId)!;
    const script = drill.reported && !drill.clicked ? `Great catch, ${drill.memberName}! You spotted the ${scenario.fromName} email and told me. That's what to do with a real one.` : drill.clicked ? `Hey ${drill.memberName}, that ${scenario.fromName} email was one of our practice ones. No harm done. The giveaways were: ${scenario.clues.map((clue) => clue.label.toLowerCase()).join("; ")}. Next time, pause and check with me first.` : `No click yet on the ${scenario.fromName} email. Don't mention it until a few days have passed.`;
    return ok({ ...drill, lessonBullets: scenario.lesson, clues: scenario.clues, coachingScript: script, lureDeliberate: drill.confirmedByMember, lureEngagementMethod: drill.confirmedByMember ? "explicit_button" : null });
  } },
  { name: "record_report", title: "Record that someone reported a drill", readOnly: false, description: "Call when the organizer says a relative spotted a practice email and told them or forwarded it instead of clicking. First check with list_drills that the sender or subject they describe matches a delivered drill. If nothing matches, it may be a real scam: tell the organizer not to click, and don't record it.", inputSchema: schema({ drillId: text("Drill id from list_drills whose sender or subject matches what the person described.") }, ["drillId"]), async run(organizerId, input) {
    if (typeof input.drillId !== "string") return fail(400, "invalid_request");
    const drill = (await listDrills(organizerId)).find((item) => item.drillId === input.drillId);
    if (!drill) return fail(404, "drill_not_found");
    if (["scheduled", "cancelled", "failed"].includes(drill.outcome)) return fail(409, "drill_not_delivered", "That drill hasn't been delivered, so the email the person saw wasn't a practice one. Tell the organizer it may be a real scam and not to click.");
    await recordReport(organizerId, input.drillId);
    return ok({ recorded: true, from: drill.fromName, subject: drill.scenarioLabel });
  } },
  { name: "get_family_report", title: "Family recap", readOnly: true, description: "Returns per-member totals of drills sent, clicked, details entered, and reported, plus each person's latest drill. Use it for a friendly recap. Never rank people or present it as a score.", inputSchema: schema(), async run(organizerId) {
    return ok({ members: await getFamilyReport(organizerId) });
  } },
  { name: "list_events", title: "Read recent activity", readOnly: true, description: "Returns the activity feed, oldest first. Pass the last cursor as since to get only new events. Types: drill.sent (sent or scheduled), drill.revealed (the person clicked through to the lesson page), lure.engaged (they confirmed the click), credentials.submitted (they pressed Sign in on a practice page; nothing they typed was sent), drill.reported (they told the organizer), drill.failed (delivery failed). Heads-up emails don't appear here.", inputSchema: schema({ since: text("Cursor from a previous event, or an ISO date.") }), async run(organizerId, input) {
    return ok({ events: await getBotEvents(organizerId, typeof input.since === "string" ? input.since : undefined) });
  } },
  { name: "pause_drills", title: "Pause all drills", readOnly: false, description: "Stop all drills for the household, including ones already scheduled.", inputSchema: schema(), async run(organizerId) {
    const paused = Boolean((await setPaused(organizerId, true))?.householdPaused);
    return ok({ paused, cancelledDrills: await cancelScheduledDrills(organizerId, {}) });
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
