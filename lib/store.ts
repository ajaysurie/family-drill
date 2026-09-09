import scenariosData from "./scenarios.json";
import type { Attempt, DrillEvent, HouseholdAgreement, Member, Scenario } from "./types";

export const scenarios = scenariosData as Scenario[];
const household: HouseholdAgreement = {
  id: "household-demo",
  organizerName: "Alex",
  termsVersion: "2026-09-01",
  status: "active",
  activatedAt: "2026-09-01T12:00:00.000Z"
};
const members: Member[] = [
  { id: "maya", name: "Maya", email: "maya@example.test", householdId: household.id },
  { id: "leo", name: "Leo", email: "leo@example.test", householdId: household.id },
  { id: "ruth", name: "Ruth", email: "ruth@example.test", householdId: household.id }
];
const attempts: Attempt[] = [
  { id: "attempt-leo", memberId: "leo", scenarioId: "garden-club", drillToken: "drill-leo", createdAt: "2026-09-02T12:00:00.000Z" }
];
const events: DrillEvent[] = [];

export function getHousehold() { return household; }
export function activateHousehold() {
  if (household.status !== "active") {
    household.status = "active";
    household.activatedAt = new Date().toISOString();
  }
  return household;
}
export function getMembers() { return members; }
export function addMember(name: string, email: string) {
  const member: Member = { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), householdId: household.id };
  if (!member.name || !member.email) return;
  members.push(member);
  return member;
}
export function findAttempt(token: string) { return attempts.find((attempt) => attempt.drillToken === token); }
export function sendAttempt(memberId: string, scenarioId: string) {
  if (household.status !== "active") return;
  const member = members.find((candidate) => candidate.id === memberId && candidate.householdId === household.id);
  const scenario = scenarios.find((candidate) => candidate.id === scenarioId);
  if (!member || !scenario) return;
  const attempt: Attempt = { id: crypto.randomUUID(), memberId, scenarioId, drillToken: crypto.randomUUID(), createdAt: new Date().toISOString() };
  attempts.push(attempt);
  return { member, scenario, attempt };
}
export function recordLureOpened(token: string) {
  const attempt = findAttempt(token);
  if (!attempt) return;
  if (!events.some((event) => event.attemptId === attempt.id)) events.push({ id: crypto.randomUUID(), attemptId: attempt.id, type: "lure_opened", occurredAt: new Date().toISOString() });
  return attempt;
}
export function getReport(memberId: string) {
  const memberAttempts = attempts.filter((attempt) => attempt.memberId === memberId);
  return { sent: memberAttempts.length, lureEngagements: events.filter((event) => memberAttempts.some((attempt) => attempt.id === event.attemptId)).length };
}
