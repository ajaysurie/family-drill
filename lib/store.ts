import scenariosData from "./scenarios.json";
import type { Attempt, BotInstall, DrillEvent, HouseholdAgreement, Member, Scenario } from "./types";

export const scenarios = scenariosData as Scenario[];
const household: HouseholdAgreement = { id: "household-demo", organizerName: "Alex", termsVersion: "2026-09-01", status: "active", activatedAt: "2026-09-01T12:00:00.000Z" };
const members: Member[] = [
  { id: "maya", name: "Maya", email: "maya@example.test", householdId: household.id },
  { id: "leo", name: "Leo", email: "leo@example.test", householdId: household.id },
  { id: "ruth", name: "Ruth", email: "ruth@example.test", householdId: household.id }
];
const attempts: Attempt[] = [{ id: "attempt-leo", memberId: "leo", scenarioId: "garden-club", drillToken: "drill-leo", createdAt: "2026-09-02T12:00:00.000Z" }];
const events: DrillEvent[] = [];
const install: BotInstall = {
  active: Boolean(process.env.FAMILY_DRILL_BOT_TOKEN), organizerEmail: process.env.FAMILY_DRILL_ORGANIZER_EMAIL ?? null,
  caps: ["members:read", "members:write", "drills:send", "events:read", "household:pause"], householdPaused: false,
  token: process.env.FAMILY_DRILL_BOT_TOKEN
};

export function getHousehold() { return household; }
export function activateHousehold() { household.status = "active"; household.activatedAt ??= new Date().toISOString(); return household; }
export function getInstall(): Omit<BotInstall, "token"> { const { token: _token, ...publicInstall } = install; return publicInstall; }
export function verifyInstall(email: string) {
  install.active = true; install.organizerEmail = email.trim(); install.householdPaused = false; install.token = crypto.randomUUID();
  return { ...getInstall(), installId: household.id, botToken: install.token };
}
export function authenticateBot(token: string | null) { return Boolean(token && install.active && token === install.token); }
export function setPaused(paused: boolean) { install.householdPaused = paused; return getInstall(); }
export function canOperate() { return install.active && !install.householdPaused && household.status === "active"; }

export function getMembers() { return members; }
export function addMember(name: string, email: string) {
  const member: Member = { id: crypto.randomUUID(), name: name.trim(), email: email.trim().toLowerCase(), householdId: household.id };
  if (!member.name || !member.email) return; members.push(member); return member;
}
export function updateMember(id: string, changes: { name?: string; email?: string }) {
  const member = members.find((item) => item.id === id); if (!member) return;
  const name = changes.name === undefined ? member.name : changes.name.trim();
  const email = changes.email === undefined ? member.email : changes.email.trim().toLowerCase();
  if (!name || !email) return;
  member.name = name; member.email = email; return member;
}
export function deleteMember(id: string) { const index = members.findIndex((item) => item.id === id); return index < 0 ? undefined : members.splice(index, 1)[0]; }
export function findAttempt(token: string) { return attempts.find((attempt) => attempt.drillToken === token); }
export function findAttemptById(id: string) { return attempts.find((attempt) => attempt.id === id); }

function addEvent(attempt: Attempt, type: DrillEvent["type"], summary: string) {
  if (!events.some((event) => event.attemptId === attempt.id && event.type === type)) events.push({ id: crypto.randomUUID(), attemptId: attempt.id, type, occurredAt: new Date().toISOString(), summary });
}
function nextAllowedTime(requested?: string) {
  const date = requested ? new Date(requested) : new Date();
  if (Number.isNaN(date.valueOf())) return;
  // Household quiet hours are 21:00–08:00 UTC in this local stub.
  if (date.getUTCHours() >= 21) { date.setUTCDate(date.getUTCDate() + 1); date.setUTCHours(8, 0, 0, 0); }
  else if (date.getUTCHours() < 8) date.setUTCHours(8, 0, 0, 0);
  return date.toISOString();
}
export function createBotDrill(memberId?: string, scenarioId: string = "surprise", sendAt?: string) {
  if (!canOperate()) return { error: install.householdPaused ? "household_paused" : "install_inactive" } as const;
  const recent = attempts.filter((item) => Date.now() - new Date(item.createdAt).valueOf() < 3_600_000);
  if (recent.length >= 5) return { error: "rate_limited" } as const;
  const member = memberId ? members.find((item) => item.id === memberId) : members[attempts.length % members.length];
  if (!member) return { error: "member_not_found" } as const;
  const scenario = scenarioId === "surprise" ? scenarios[attempts.length % scenarios.length] : scenarios.find((item) => item.id === scenarioId);
  if (!scenario) return { error: "scenario_not_found" } as const;
  const scheduledFor = nextAllowedTime(sendAt); if (!scheduledFor) return { error: "invalid_send_at" } as const;
  const attempt: Attempt = { id: crypto.randomUUID(), memberId: member.id, scenarioId: scenario.id, drillToken: crypto.randomUUID(), createdAt: new Date().toISOString(), scheduledFor };
  attempts.push(attempt); addEvent(attempt, "drill.sent", `Fictional ${scenario.subject} drill queued for ${member.name}.`);
  console.info(`[family-drill] queued fictional drill ${attempt.id} for ${member.email} at ${scheduledFor}`);
  return { attempt, member, scenario };
}
export function sendAttempt(memberId: string, scenarioId: string) {
  const result = createBotDrill(memberId, scenarioId);
  return "error" in result ? undefined : result;
}
export function recordReveal(token: string) { const attempt = findAttempt(token); if (attempt) addEvent(attempt, "drill.revealed", "The drill lesson was revealed."); return attempt; }
export function recordLureOpened(token: string) { const attempt = findAttempt(token); if (attempt) addEvent(attempt, "lure.engaged", "The member deliberately confirmed opening the practice lure."); return attempt; }
export function getBotEvents(since?: string) {
  const index = since ? events.findIndex((event) => event.id === since) : -1;
  const cutoff = since && index < 0 ? Date.parse(since) : NaN;
  return events.filter((event, eventIndex) => eventIndex > index && (Number.isNaN(cutoff) || Date.parse(event.occurredAt) > cutoff)).map((event) => {
    const attempt = findAttemptById(event.attemptId)!; const member = members.find((item) => item.id === attempt.memberId);
    return { cursor: event.id, type: event.type, at: event.occurredAt, drillId: attempt.id, memberName: member?.name ?? "Former household member", summary: event.summary };
  });
}
export function getReport(memberId: string) { const relevant = attempts.filter((item) => item.memberId === memberId); return { sent: relevant.length, lureEngagements: events.filter((event) => relevant.some((item) => item.id === event.attemptId) && event.type === "lure.engaged").length }; }
