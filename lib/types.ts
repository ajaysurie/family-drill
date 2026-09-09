export type Consent = { status: "pending" | "accepted"; acceptedAt?: string };
export type Participant = { id: string; name: string; email: string; inviteToken: string; consent: Consent };
export type Attempt = { id: string; participantId: string; scenarioId: string; drillToken: string; sentAt: string };
export type DrillEvent = { id: string; attemptId: string; type: "deliberate_click"; occurredAt: string };
export type Scenario = { id: string; fromName: string; subject: string; preview: string; lesson: [string, string, string] };
