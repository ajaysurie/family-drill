export type HouseholdAgreement = {
  id: string;
  organizerName: string;
  termsVersion: string;
  status: "draft" | "active";
  activatedAt?: string;
};

export type Member = { id: string; name: string; email: string; householdId: string };
export type Attempt = { id: string; memberId: string; scenarioId: string; drillToken: string; createdAt: string; scheduledFor?: string };
export type DrillEvent = {
  id: string;
  attemptId: string;
  type: "drill.sent" | "drill.revealed" | "lure.engaged" | "drill.failed";
  occurredAt: string;
  summary: string;
};
export type Scenario = { id: string; fromName: string; subject: string; preview: string; lesson: [string, string, string] };
export type BotInstall = {
  active: boolean;
  organizerEmail: string | null;
  caps: string[];
  householdPaused: boolean;
  token?: string;
};
