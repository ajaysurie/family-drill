import scenariosData from "./scenarios.json";
import type { Attempt, DrillEvent, Participant, Scenario } from "./types";

export const scenarios = scenariosData as Scenario[];
const participants: Participant[] = [
  { id: "maya", name: "Maya", email: "maya@example.test", inviteToken: "invite-maya", consent: { status: "pending" } },
  { id: "leo", name: "Leo", email: "leo@example.test", inviteToken: "invite-leo", consent: { status: "accepted", acceptedAt: "2026-01-10T12:00:00.000Z" } },
  { id: "ruth", name: "Ruth", email: "ruth@example.test", inviteToken: "invite-ruth", consent: { status: "accepted", acceptedAt: "2026-01-12T12:00:00.000Z" } }
];
const attempts: Attempt[] = [
  { id: "attempt-leo", participantId: "leo", scenarioId: "garden-club", drillToken: "drill-leo", sentAt: "2026-01-15T12:00:00.000Z" }
];
const events: DrillEvent[] = [];

export function getParticipants() { return participants; }
export function findInvite(token: string) { return participants.find((p) => p.inviteToken === token); }
export function acceptInvite(token: string) {
  const participant = findInvite(token);
  if (participant && participant.consent.status !== "accepted") participant.consent = { status: "accepted", acceptedAt: new Date().toISOString() };
  return participant;
}
export function findAttempt(token: string) { return attempts.find((attempt) => attempt.drillToken === token); }
export function sendAttempt(participantId: string, scenarioId: string) {
  const participant = participants.find((p) => p.id === participantId && p.consent.status === "accepted");
  const scenario = scenarios.find((s) => s.id === scenarioId);
  if (!participant || !scenario) return;
  const attempt: Attempt = { id: crypto.randomUUID(), participantId, scenarioId, drillToken: crypto.randomUUID(), sentAt: new Date().toISOString() };
  attempts.push(attempt);
  return { participant, scenario, attempt };
}
export function recordDeliberateClick(token: string) {
  const attempt = findAttempt(token);
  if (!attempt) return;
  if (!events.some((event) => event.attemptId === attempt.id)) events.push({ id: crypto.randomUUID(), attemptId: attempt.id, type: "deliberate_click", occurredAt: new Date().toISOString() });
  return attempt;
}
export function getReport(participantId: string) {
  const participantAttempts = attempts.filter((a) => a.participantId === participantId);
  return { sent: participantAttempts.length, deliberateClicks: events.filter((e) => participantAttempts.some((a) => a.id === e.attemptId)).length };
}
