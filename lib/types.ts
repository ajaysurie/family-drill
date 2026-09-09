export type HouseholdAgreement = {
  id: string;
  organizerName: string;
  termsVersion: string;
  status: "draft" | "active";
  activatedAt?: string;
};

export type Member = { id: string; name: string; email: string; householdId: string };
export type Attempt = { id: string; memberId: string; scenarioId: string; drillToken: string; createdAt: string };
export type DrillEvent = { id: string; attemptId: string; type: "lure_opened"; occurredAt: string };
export type Scenario = { id: string; fromName: string; subject: string; preview: string; lesson: [string, string, string] };
