import type { Attempt, Member, Scenario } from "./types";
import { renderDrillEmail } from "./render-drill-email";

export type DrillMessage = { member: Member; scenario: Scenario; attempt: Attempt };
export interface MailAdapter { sendDrill(message: DrillMessage): Promise<void> }

export const consoleMailAdapter: MailAdapter = {
  async sendDrill({ member, scenario, attempt }) {
    const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
    const message = renderDrillEmail(scenario, member, `${baseUrl}/d/${attempt.drillToken}`);
    console.log(`[mail:stub]\nFrom: ${message.from}\nTo: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n\n[HTML: ${Buffer.byteLength(message.html)} bytes]`);
  }
};
