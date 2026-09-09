import type { Attempt, Member, Scenario } from "./types";

export type DrillMessage = { member: Member; scenario: Scenario; attempt: Attempt };
export interface MailAdapter { sendDrill(message: DrillMessage): Promise<void> }

export const consoleMailAdapter: MailAdapter = {
  async sendDrill({ member, scenario, attempt }) {
    const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
    console.log(`[mail:stub] To: ${member.email} | ${scenario.subject} | ${baseUrl}/d/${attempt.drillToken}`);
  }
};
