import type { Attempt, Participant, Scenario } from "./types";

export type DrillMessage = { participant: Participant; scenario: Scenario; attempt: Attempt };
export interface MailAdapter { sendDrill(message: DrillMessage): Promise<void> }

export const consoleMailAdapter: MailAdapter = {
  async sendDrill({ participant, scenario, attempt }) {
    const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
    console.log(`[mail:stub] To: ${participant.email} | ${scenario.subject} | ${baseUrl}/d/${attempt.drillToken}`);
  }
};
