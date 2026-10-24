import { and, asc, count, desc, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import scenariosData from "./scenarios.json";
import { db, ensureSchema } from "./db";
import { getMailAdapter } from "./mail";
import { attempts, botInstalls, drillEvents, householdAgreements, members, organizers } from "./schema";
import { MAX_MEMBERS, drillStatus, nextAllowedTime, pickMember, pickScenario, type DrillStatus, type PastDrill } from "./drill-planning";
import type { Attempt, BotInstall, DrillEvent, HouseholdAgreement, Member, Scenario, ScenarioCategory } from "./types";

export const scenarios = scenariosData as Scenario[];
const caps = ["members:read", "members:write", "drills:send", "events:read", "household:pause"];
const agreement = (row: typeof householdAgreements.$inferSelect & { organizerName: string | null }): HouseholdAgreement => ({ id: row.id, organizerName: row.organizerName ?? "Organizer", termsVersion: row.termsVersion, status: row.status, activatedAt: row.activatedAt?.toISOString(), timeZone: row.timeZone ?? undefined });
const attempt = (row: typeof attempts.$inferSelect): Attempt => ({ ...row, createdAt: row.createdAt.toISOString(), scheduledFor: row.scheduledFor?.toISOString() });
const publicInstall = (row: typeof botInstalls.$inferSelect & { organizerEmail?: string | null }): Omit<BotInstall, "token"> => ({ active: Boolean(row.active), organizerEmail: row.organizerEmail ?? null, caps, householdPaused: Boolean(row.householdPaused) });

export async function getHousehold(organizerId: string) { await ensureSchema(); const [row] = await db.select({ ...getTableColumns(householdAgreements), organizerName: organizers.name }).from(householdAgreements).innerJoin(organizers, eq(householdAgreements.organizerId, organizers.id)).where(eq(householdAgreements.organizerId, organizerId)); return row ? agreement(row) : undefined; }
export async function activateHousehold(organizerId: string) { await ensureSchema(); await db.update(householdAgreements).set({ status: "active", activatedAt: sql`coalesce(${householdAgreements.activatedAt}, now())` }).where(eq(householdAgreements.organizerId, organizerId)); return getHousehold(organizerId); }
export const allCategories: ScenarioCategory[] = ["delivery", "bank-payment", "subscriptions", "tech-support", "school-kids", "account-lockout"];
export type DrillPreferences = { enabledCategories: ScenarioCategory[]; smsPreview: boolean; timeZone: string | null; organizerName: string | null };
export async function getDrillPreferences(organizerId: string): Promise<DrillPreferences> { await ensureSchema(); const [row] = await db.select({ enabledCategories: householdAgreements.enabledCategories, smsPreview: householdAgreements.smsPreview, timeZone: householdAgreements.timeZone, organizerName: organizers.name }).from(householdAgreements).innerJoin(organizers, eq(householdAgreements.organizerId, organizers.id)).where(eq(householdAgreements.organizerId, organizerId)); return { enabledCategories: (row?.enabledCategories?.split(",").filter(Boolean) ?? allCategories) as ScenarioCategory[], smsPreview: Boolean(row?.smsPreview), timeZone: row?.timeZone ?? null, organizerName: row?.organizerName ?? null }; }
export async function setDrillPreferences(organizerId: string, changes: Partial<Omit<DrillPreferences, "organizerName">> & { organizerName?: string }) { await ensureSchema(); const enabledCategories = changes.enabledCategories && allCategories.filter((category) => changes.enabledCategories!.includes(category)); const values = { ...(enabledCategories && { enabledCategories: enabledCategories.join(",") }), ...(changes.smsPreview !== undefined && { smsPreview: changes.smsPreview ? 1 : 0 }), ...(changes.timeZone !== undefined && { timeZone: changes.timeZone }) }; if (Object.keys(values).length) await db.update(householdAgreements).set(values).where(eq(householdAgreements.organizerId, organizerId)); if (changes.organizerName?.trim()) await db.update(organizers).set({ name: changes.organizerName.trim() }).where(eq(organizers.id, organizerId)); return getDrillPreferences(organizerId); }
export async function getMembers(organizerId: string) { await ensureSchema(); return (await db.select({ id: members.id, name: members.name, email: members.email, householdId: members.householdId, optedOutAt: members.optedOutAt }).from(members).innerJoin(householdAgreements, and(eq(members.householdId, householdAgreements.id), eq(householdAgreements.organizerId, organizerId))).orderBy(members.name)).map(({ optedOutAt, ...member }) => ({ ...member, receivingDrills: !optedOutAt })); }
export async function addMember(organizerId: string, name: string, email: string) { await ensureSchema(); const cleanName = name.trim(), cleanEmail = email.trim().toLowerCase(); if (!cleanName || !cleanEmail) return; const [household] = await db.select({ id: householdAgreements.id }).from(householdAgreements).where(eq(householdAgreements.organizerId, organizerId)); if (!household) return; const [{ total }] = await db.select({ total: count() }).from(members).where(eq(members.householdId, household.id)); if (total >= MAX_MEMBERS) return; const [created] = await db.insert(members).values({ name: cleanName, email: cleanEmail, householdId: household.id }).returning(); return created; }
export async function sendHeadsUp(organizerId: string, memberId: string) { await ensureSchema(); const member = (await getMembers(organizerId)).find((item) => item.id === memberId); if (!member) return false; const [organizer] = await db.select({ name: organizers.name, email: organizers.email }).from(organizers).where(eq(organizers.id, organizerId)); await getMailAdapter().sendHeadsUp({ member, organizer: organizer?.name?.trim() || organizer?.email || "Your family organizer" }); return true; }
export async function updateMember(organizerId: string, id: string, changes: { name?: string; email?: string; receivingDrills?: boolean }) { await ensureSchema(); const values = { ...(changes.name !== undefined && { name: changes.name.trim() }), ...(changes.email !== undefined && { email: changes.email.trim().toLowerCase() }), ...(changes.receivingDrills !== undefined && { optedOutAt: changes.receivingDrills ? null : new Date() }) }; if (("name" in values && !values.name) || ("email" in values && !values.email)) return; const [row] = await db.update(members).set(values).from(householdAgreements).where(and(eq(members.id, id), eq(members.householdId, householdAgreements.id), eq(householdAgreements.organizerId, organizerId))).returning(); return row; }
export async function deleteMember(organizerId: string, id: string) { await ensureSchema(); const owned = (await getMembers(organizerId)).some((member) => member.id === id); if (!owned) return; const [row] = await db.delete(members).where(eq(members.id, id)).returning(); return row; }

async function installForToken(token: string) { const [row] = await db.select({ install: botInstalls, organizerId: householdAgreements.organizerId, organizerEmail: organizers.email }).from(botInstalls).innerJoin(householdAgreements, eq(botInstalls.householdId, householdAgreements.id)).innerJoin(organizers, eq(householdAgreements.organizerId, organizers.id)).where(eq(botInstalls.token, token)); return row; }
export async function authenticateBot(token: string | null) { await ensureSchema(); if (!token) return; const row = await installForToken(token); return row?.install.active ? { organizerId: row.organizerId, token } : undefined; }
export async function getInstall(token: string) { await ensureSchema(); const row = await installForToken(token); return row ? publicInstall({ ...row.install, organizerEmail: row.organizerEmail }) : undefined; }
export async function verifyInstall(organizerId: string, rotate = false) { await ensureSchema(); const household = await getHousehold(organizerId); if (!household) return; await activateHousehold(organizerId); const [existing] = await db.select().from(botInstalls).where(eq(botInstalls.householdId, household.id)); if (existing?.active && !rotate) return { ...publicInstall(existing), installId: existing.id, botToken: existing.token }; const token = crypto.randomUUID(); const [row] = await db.insert(botInstalls).values({ householdId: household.id, token, active: 1, householdPaused: 0 }).onConflictDoUpdate({ target: botInstalls.householdId, set: { token, active: 1, householdPaused: 0 } }).returning(); return { ...publicInstall(row), installId: row.id, botToken: token }; }
export async function setPaused(organizerId: string, paused: boolean) { await ensureSchema(); const [row] = await db.update(botInstalls).set({ householdPaused: paused ? 1 : 0 }).from(householdAgreements).where(and(eq(botInstalls.householdId, householdAgreements.id), eq(householdAgreements.organizerId, organizerId))).returning(); return row ? publicInstall(row) : undefined; }
async function getOperationState(organizerId: string) { const [row] = await db.select({ active: botInstalls.active, paused: botInstalls.householdPaused, status: householdAgreements.status }).from(botInstalls).innerJoin(householdAgreements, eq(botInstalls.householdId, householdAgreements.id)).where(eq(householdAgreements.organizerId, organizerId)); return row; }
export async function isPaused(organizerId: string) { await ensureSchema(); return Boolean((await getOperationState(organizerId))?.paused); }
export async function canOperate(organizerId: string) {
  await ensureSchema();
  let state = await getOperationState(organizerId);
  if (state?.active && !state.paused && state.status === "draft") {
    await activateHousehold(organizerId);
    state = await getOperationState(organizerId);
  }
  return Boolean(state?.active && !state.paused && state.status === "active");
}

export async function findAttempt(token: string) { await ensureSchema(); const [row] = await db.select().from(attempts).where(eq(attempts.drillToken, token)); return row ? attempt(row) : undefined; }
export async function getRevealContext(token: string) { await ensureSchema(); const [row] = await db.select({ attempt: attempts, memberName: members.name, organizerName: organizers.name, organizerEmail: organizers.email }).from(attempts).innerJoin(members, eq(attempts.memberId, members.id)).innerJoin(householdAgreements, eq(members.householdId, householdAgreements.id)).innerJoin(organizers, eq(householdAgreements.organizerId, organizers.id)).where(eq(attempts.drillToken, token)); const scenario = row && scenarios.find((item) => item.id === row.attempt.scenarioId); return row && scenario ? { attempt: attempt(row.attempt), scenario, memberName: row.memberName, organizer: row.organizerName?.trim() || "your family organizer" } : undefined; }
export async function findAttemptById(organizerId: string, id: string) { await ensureSchema(); const [row] = await db.select({ attempt: attempts }).from(attempts).innerJoin(members, eq(attempts.memberId, members.id)).innerJoin(householdAgreements, and(eq(members.householdId, householdAgreements.id), eq(householdAgreements.organizerId, organizerId))).where(eq(attempts.id, id)); return row ? attempt(row.attempt) : undefined; }
async function addEvent(found: Attempt, type: DrillEvent["type"], summary: string) { await db.insert(drillEvents).values({ attemptId: found.id, type, summary }).onConflictDoNothing(); }
export async function hasLureEngagement(attemptId: string) { await ensureSchema(); const [row] = await db.select({ total: count() }).from(drillEvents).where(and(eq(drillEvents.attemptId, attemptId), eq(drillEvents.type, "lure.engaged"))); return Boolean(row?.total); }
async function drillHistory(organizerId: string): Promise<PastDrill[]> { return db.select({ memberId: attempts.memberId, scenarioId: attempts.scenarioId, createdAt: attempts.createdAt }).from(attempts).innerJoin(members, eq(attempts.memberId, members.id)).innerJoin(householdAgreements, and(eq(members.householdId, householdAgreements.id), eq(householdAgreements.organizerId, organizerId))); }
export type DrillRequestError = "install_inactive_or_paused" | "rate_limited" | "member_not_found" | "member_opted_out" | "everyone_recently_drilled" | "no_members" | "no_enabled_categories" | "scenario_not_found" | "scenario_disabled" | "invalid_send_at" | "send_at_too_far" | "delivery_failed";
export async function createBotDrill(organizerId: string, memberId?: string, scenarioId = "surprise", sendAt?: string): Promise<{ error: DrillRequestError } | { attempt: Attempt; member: Member; scenario: Scenario }> {
  await ensureSchema();
  if (!await canOperate(organizerId)) return { error: "install_inactive_or_paused" };
  const history = await drillHistory(organizerId);
  if (history.filter((drill) => drill.createdAt.valueOf() > Date.now() - 3_600_000).length >= 5) return { error: "rate_limited" };
  const householdMembers = await getMembers(organizerId);
  if (!householdMembers.length) return { error: "no_members" };
  const due = householdMembers.filter((item) => item.receivingDrills && !history.some((drill) => drill.memberId === item.id && drill.createdAt.valueOf() > Date.now() - 12 * 3_600_000));
  if (!memberId && !householdMembers.some((item) => item.receivingDrills)) return { error: "no_members" };
  if (!memberId && !due.length) return { error: "everyone_recently_drilled" };
  const member = memberId ? householdMembers.find((item) => item.id === memberId) : pickMember(due, history);
  if (!member) return { error: "member_not_found" };
  if (!member.receivingDrills) return { error: "member_opted_out" };
  const { enabledCategories, timeZone } = await getDrillPreferences(organizerId);
  const eligible = scenarios.filter((item) => enabledCategories.includes(item.category));
  if (!eligible.length) return { error: "no_enabled_categories" };
  const requested = scenarios.find((item) => item.id === scenarioId);
  if (scenarioId !== "surprise" && !requested) return { error: "scenario_not_found" };
  if (requested && !eligible.includes(requested)) return { error: "scenario_disabled" };
  const scenario = requested ?? pickScenario(eligible, history, member.id);
  const sendTime = nextAllowedTime(sendAt, timeZone ?? "UTC");
  if ("error" in sendTime) return sendTime;
  const [created] = await db.insert(attempts).values({ memberId: member.id, scenarioId: scenario.id, scheduledFor: sendTime.at }).returning();
  const result = attempt(created);
  try {
    const providerMessageId = await getMailAdapter().sendDrill({ attempt: result, member, scenario });
    if (providerMessageId) await db.update(attempts).set({ providerMessageId }).where(eq(attempts.id, result.id));
  } catch (error) {
    console.error(`[family-drill] delivery failed for drill ${result.id}`, error);
    await addEvent(result, "drill.failed", `The ${scenario.fromName} drill to ${member.name} could not be delivered.`);
    return { error: "delivery_failed" };
  }
  const when = sendTime.at.valueOf() > Date.now() + 60_000 ? `scheduled for ${sendTime.at.toISOString()}` : "sent";
  await addEvent(result, "drill.sent", `${scenario.fromName} drill "${scenario.subject}" ${when} to ${member.name}.`);
  console.info(`[family-drill] drill ${result.id} ${when} for ${member.email}`);
  return { attempt: result, member, scenario };
}
export async function recordReveal(token: string) { await ensureSchema(); const found = await findAttempt(token); if (found) await addEvent(found, "drill.revealed", "The member clicked the drill link."); return found; }
export async function recordLureOpened(token: string) { await ensureSchema(); const found = await findAttempt(token); if (found) await addEvent(found, "lure.engaged", "The member deliberately confirmed opening the practice lure."); return found; }
export async function recordCredentialSubmit(token: string) { await ensureSchema(); const found = await findAttempt(token); if (found) { await addEvent(found, "lure.engaged", "The member opened the fictional portal."); await addEvent(found, "credentials.submitted", "The member submitted the portal form; no field values were received or stored."); } return found; }
export async function getBotEvents(organizerId: string, since?: string) { await ensureSchema(); const rows = await db.select({ event: drillEvents, attempt: attempts, memberName: members.name }).from(drillEvents).innerJoin(attempts, eq(drillEvents.attemptId, attempts.id)).innerJoin(members, eq(attempts.memberId, members.id)).innerJoin(householdAgreements, and(eq(members.householdId, householdAgreements.id), eq(householdAgreements.organizerId, organizerId))).orderBy(asc(drillEvents.occurredAt)); const index = since ? rows.findIndex(({ event }) => event.id === since) : -1; const cutoff = since && index < 0 ? Date.parse(since) : NaN; return rows.filter(({ event }, eventIndex) => eventIndex > index && (Number.isNaN(cutoff) || event.occurredAt.valueOf() > cutoff)).map(({ event, attempt: found, memberName }) => ({ cursor: event.id, type: event.type, at: event.occurredAt.toISOString(), drillId: found.id, memberName, summary: event.summary })); }
export type DrillSummary = DrillStatus & { drillId: string; memberId: string; memberName: string; scenarioId: string; scenarioLabel: string; fromName: string; category: ScenarioCategory; createdAt: string; scheduledFor?: string };
export async function listDrills(organizerId: string, memberId?: string): Promise<DrillSummary[]> {
  await ensureSchema();
  const rows = await db.select({ attempt: attempts, memberName: members.name }).from(attempts).innerJoin(members, eq(attempts.memberId, members.id)).innerJoin(householdAgreements, and(eq(members.householdId, householdAgreements.id), eq(householdAgreements.organizerId, organizerId))).where(memberId ? eq(attempts.memberId, memberId) : undefined).orderBy(desc(attempts.createdAt));
  const events = rows.length ? await db.select({ attemptId: drillEvents.attemptId, type: drillEvents.type }).from(drillEvents).where(inArray(drillEvents.attemptId, rows.map(({ attempt: row }) => row.id))) : [];
  return rows.map(({ attempt: row, memberName }) => {
    const scenario = scenarios.find((item) => item.id === row.scenarioId);
    return { drillId: row.id, memberId: row.memberId, memberName, scenarioId: row.scenarioId, scenarioLabel: scenario?.subject ?? row.scenarioId, fromName: scenario?.fromName ?? "", category: scenario?.category ?? "delivery", createdAt: row.createdAt.toISOString(), scheduledFor: row.scheduledFor?.toISOString(), ...drillStatus(events.filter((event) => event.attemptId === row.id).map((event) => event.type), row.scheduledFor ?? undefined) };
  });
}
export async function getFamilyReport(organizerId: string) {
  const [householdMembers, drills] = await Promise.all([getMembers(organizerId), listDrills(organizerId)]);
  return householdMembers.map((member) => {
    const mine = drills.filter((drill) => drill.memberId === member.id);
    const own = mine.filter((drill) => !["failed", "scheduled", "cancelled"].includes(drill.outcome));
    const count = (test: (drill: DrillSummary) => boolean) => own.filter(test).length;
    return { memberId: member.id, name: member.name, receivingDrills: member.receivingDrills, scheduled: mine.filter((drill) => drill.outcome === "scheduled").length, drillsSent: own.length, clicked: count((drill) => drill.clicked), enteredDetails: count((drill) => drill.enteredDetails), reported: count((drill) => drill.reported), lastDrill: own[0] ? { drillId: own[0].drillId, scenarioLabel: own[0].scenarioLabel, outcome: own[0].outcome, createdAt: own[0].createdAt } : null };
  });
}
// Scheduled drills sit in the email provider's queue until their send time, so stopping
// someone has to pull those out too.
export async function cancelScheduledDrills(organizerId: string, scope: { memberId?: string; drillId?: string }) {
  const pending = (await listDrills(organizerId, scope.memberId)).filter((drill) => drill.outcome === "scheduled" && (!scope.drillId || drill.drillId === scope.drillId));
  const cancelled: string[] = [];
  for (const drill of pending) {
    const [row] = await db.select().from(attempts).where(eq(attempts.id, drill.drillId));
    if (row.providerMessageId) await getMailAdapter().cancelDrill(row.providerMessageId);
    await addEvent(attempt(row), "drill.cancelled", `The scheduled ${drill.fromName} drill to ${drill.memberName} was cancelled.`);
    cancelled.push(drill.drillId);
  }
  return cancelled;
}
export async function recordReport(organizerId: string, drillId: string) { const found = await findAttemptById(organizerId, drillId); if (found) await addEvent(found, "drill.reported", "The member spotted the drill and reported it to the organizer."); return found; }
