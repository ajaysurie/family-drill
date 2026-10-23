import type { DrillEventType, Member, Scenario, ScenarioCategory } from "./types";

export const QUIET_HOURS = { start: 21, end: 8 } as const;
export const MAX_SCHEDULE_LEAD_MS = 72 * 3_600_000;

export function isValidTimeZone(timeZone: string) {
  try { new Intl.DateTimeFormat("en-US", { timeZone }); return true; } catch { return false; }
}

const localHour = (date: Date, timeZone: string) => Number(new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" }).format(date));

export type SendTime = { at: Date } | { error: "invalid_send_at" | "send_at_too_far" };

// Quiet hours are evaluated in the household's own time zone so nobody gets a 3 a.m. drill.
export function nextAllowedTime(requested: string | undefined, timeZone = "UTC", now = new Date()): SendTime {
  const asked = requested ? new Date(requested) : new Date(now);
  if (Number.isNaN(asked.valueOf())) return { error: "invalid_send_at" };
  if (asked.valueOf() - now.valueOf() > MAX_SCHEDULE_LEAD_MS) return { error: "send_at_too_far" };
  const at = asked < now ? new Date(now) : asked;
  const hour = localHour(at, timeZone);
  if (hour >= QUIET_HOURS.end && hour < QUIET_HOURS.start) return { at };
  at.setUTCMinutes(0, 0, 0);
  do at.setUTCHours(at.getUTCHours() + 1); while (localHour(at, timeZone) !== QUIET_HOURS.end);
  return { at };
}

export type PastDrill = { memberId: string; scenarioId: string; createdAt: Date };

// Spread drills across the family: fewest drills first, then whoever waited longest.
export function pickMember(members: Member[], history: PastDrill[]) {
  const stats = (id: string) => {
    const own = history.filter((drill) => drill.memberId === id);
    return { count: own.length, last: Math.max(0, ...own.map((drill) => drill.createdAt.valueOf())) };
  };
  return [...members].sort((a, b) => { const x = stats(a.id), y = stats(b.id); return x.count - y.count || x.last - y.last || a.name.localeCompare(b.name); })[0];
}

// Prefer lures this person has never seen, from a different category than their last one.
export function pickScenario(eligible: Scenario[], history: PastDrill[], memberId: string, random = Math.random) {
  const own = history.filter((drill) => drill.memberId === memberId).sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf());
  const lastSeen = (id: string) => own.findIndex((drill) => drill.scenarioId === id);
  const unseen = eligible.filter((scenario) => lastSeen(scenario.id) < 0);
  const pool = unseen.length ? unseen : [...eligible].sort((a, b) => lastSeen(b.id) - lastSeen(a.id)).slice(0, Math.max(1, Math.ceil(eligible.length / 2)));
  const lastCategory = eligible.find((scenario) => scenario.id === own[0]?.scenarioId)?.category;
  const fresh = pool.filter((scenario) => scenario.category !== lastCategory);
  const choices = fresh.length ? fresh : pool;
  return choices[Math.floor(random() * choices.length)];
}

export type DrillOutcome = "scheduled" | "sent" | "clicked" | "entered-details" | "reported" | "failed";
export type DrillStatus = { outcome: DrillOutcome; clicked: boolean; confirmedByMember: boolean; enteredDetails: boolean; reported: boolean };

export function drillStatus(events: DrillEventType[], scheduledFor: Date | undefined, now = new Date()): DrillStatus {
  const has = (type: DrillEventType) => events.includes(type);
  const confirmedByMember = has("lure.engaged"), enteredDetails = has("credentials.submitted"), reported = has("drill.reported");
  const clicked = confirmedByMember || enteredDetails || has("drill.revealed");
  const outcome: DrillOutcome = has("drill.failed") ? "failed" : enteredDetails ? "entered-details" : clicked ? "clicked" : reported ? "reported" : scheduledFor && scheduledFor > now ? "scheduled" : "sent";
  return { outcome, clicked, confirmedByMember, enteredDetails, reported };
}

export const categoryLabels: Record<ScenarioCategory, string> = {
  delivery: "Package & delivery",
  "bank-payment": "Bank, payment & toll alerts",
  subscriptions: "Subscriptions & cloud storage",
  "tech-support": "Tech support & virus notices",
  "school-kids": "School & kids accounts",
  "account-lockout": "Account lockouts & shared files",
};
