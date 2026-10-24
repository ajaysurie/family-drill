import type { Attempt, Member, Scenario } from "./types";
import { renderDrillEmail } from "./render-drill-email";
import { appBaseUrl } from "./email-assets";
import { headsUpEmail } from "./family-drill-email";
import { Resend } from "resend";

export type DrillMessage = { member: Member; scenario: Scenario; attempt: Attempt };
export type HeadsUpMessage = { member: Member; organizer: string };
export interface MailAdapter { sendDrill(message: DrillMessage): Promise<string | undefined>; cancelDrill(messageId: string): Promise<void>; sendHeadsUp(message: HeadsUpMessage): Promise<void> }

type ResendClient = { emails: Pick<Resend["emails"], "send" | "cancel"> };

// Drills keep the verified sending address and borrow only the invented display name, so
// "check the real address" is always a clue the family can catch.
export const senderAddress = (from: string) => from.match(/<([^>]+)>/)?.[1] ?? from.trim();
export const drillSender = () => process.env.MAIL_ADAPTER === "resend" && process.env.EMAIL_FROM ? senderAddress(process.env.EMAIL_FROM) : "drills@localhost";
export const drillUrl = ({ scenario, attempt }: DrillMessage) => `${appBaseUrl()}/${scenario.portalStage ? "p" : "d"}/${attempt.drillToken}`;
const renderDrill = (message: DrillMessage) => renderDrillEmail(message.scenario, message.member, drillUrl(message), appBaseUrl());
const scheduledAt = (attempt: Attempt) => attempt.scheduledFor && Date.parse(attempt.scheduledFor) > Date.now() + 60_000 ? attempt.scheduledFor : undefined;

export function createResendMailAdapter(client: ResendClient, from: string): MailAdapter {
  const send = async (payload: Parameters<ResendClient["emails"]["send"]>[0], kind: string) => {
    const { data, error } = await client.emails.send(payload);
    if (error) throw new Error(`Resend failed to send ${kind} email: ${error.message}`);
    return data?.id;
  };
  return {
    async sendDrill(message) {
      const email = renderDrill(message), when = scheduledAt(message.attempt);
      return send({ from: `${email.fromName} <${senderAddress(from)}>`, to: email.to, subject: email.subject, text: email.text, html: email.html, headers: { "X-Family-Drill": "household-practice-drill" }, ...(when && { scheduledAt: when }) }, "drill");
    },
    async cancelDrill(messageId) {
      const { error } = await client.emails.cancel(messageId);
      if (error) throw new Error(`Resend failed to cancel drill email: ${error.message}`);
    },
    async sendHeadsUp({ member, organizer }) {
      const email = headsUpEmail(member.name, organizer);
      await send({ from, to: member.email, subject: email.subject, text: email.text, html: email.html }, "heads-up");
    },
  };
}

export const consoleMailAdapter: MailAdapter = {
  async sendDrill(message) {
    const email = renderDrill(message);
    console.log(`[mail:stub]\nFrom: ${email.fromName} <${drillSender()}>\nTo: ${email.to}\nSubject: ${email.subject}\nScheduled: ${scheduledAt(message.attempt) ?? "now"}\n\n${email.text}\n\n[HTML: ${Buffer.byteLength(email.html)} bytes]`);
    return `stub-${message.attempt.id}`;
  },
  async cancelDrill(messageId) {
    console.log(`[mail:stub] cancelled ${messageId}`);
  },
  async sendHeadsUp({ member, organizer }) {
    const email = headsUpEmail(member.name, organizer);
    console.log(`[mail:stub]\nTo: ${member.email}\nSubject: ${email.subject}\n\n${email.text}`);
  },
};

export function getMailAdapter(): MailAdapter {
  if (process.env.MAIL_ADAPTER !== "resend") return consoleMailAdapter;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is required when MAIL_ADAPTER=resend");

  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is required when MAIL_ADAPTER=resend");

  return createResendMailAdapter(new Resend(apiKey), from);
}
