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
  type: "drill.sent" | "drill.revealed" | "lure.engaged" | "credentials.submitted" | "drill.failed";
  occurredAt: string;
  summary: string;
};
export type Scenario = {
  id: string;
  category: ScenarioCategory;
  layoutId: "cta-hero" | "security-banner" | "receipt-table" | "tracking-card";
  brandId: BrandId;
  fromName: string;
  subject: string;
  preview: string;
  lesson: [string, string, string];
  fromLocalPart?: string;
  fromDomain?: string;
  preheader?: string;
  bodyParagraphs?: string[];
  bodyHtml?: string;
  ctaLabel?: string;
  footerLines?: string[];
  portalStage?: boolean;
  smsBody?: string;
  lineItems?: { label: string; amount: string }[];
};
export type ScenarioCategory = "delivery" | "bank-payment" | "subscriptions" | "tech-support" | "school-kids" | "account-lockout";
export type BrandId = "swiftbox" | "riverline" | "streamly" | "softshield" | "maple-district" | "paynest";
export type BotInstall = {
  active: boolean;
  organizerEmail: string | null;
  caps: string[];
  householdPaused: boolean;
  token?: string;
};
