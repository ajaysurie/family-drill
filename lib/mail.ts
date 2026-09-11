import type { Attempt, Member, Scenario } from "./types";
import { renderDrillEmail } from "./render-drill-email";
import { Resend } from "resend";

export type DrillMessage = { member: Member; scenario: Scenario; attempt: Attempt };
export interface MailAdapter { sendDrill(message: DrillMessage): Promise<void> }

type ResendClient = Pick<Resend, "emails">;

export function createResendMailAdapter(client: ResendClient, from: string): MailAdapter {
  return {
    async sendDrill({ member, scenario, attempt }) {
      const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
      const message = renderDrillEmail(scenario, member, `${baseUrl}/${scenario.portalStage ? "p" : "d"}/${attempt.drillToken}`);
      const { error } = await client.emails.send({
        from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });

      if (error) throw new Error(`Resend failed to send drill email: ${error.message}`);
    },
  };
}

export const consoleMailAdapter: MailAdapter = {
  async sendDrill({ member, scenario, attempt }) {
    const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
    const message = renderDrillEmail(scenario, member, `${baseUrl}/${scenario.portalStage ? "p" : "d"}/${attempt.drillToken}`);
    console.log(`[mail:stub]\nFrom: ${message.from}\nTo: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n\n[HTML: ${Buffer.byteLength(message.html)} bytes]`);
  }
};

export function getMailAdapter(): MailAdapter {
  if (process.env.MAIL_ADAPTER !== "resend") return consoleMailAdapter;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is required when MAIL_ADAPTER=resend");

  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is required when MAIL_ADAPTER=resend");

  return createResendMailAdapter(new Resend(apiKey), from);
}
