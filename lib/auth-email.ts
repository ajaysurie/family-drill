import { Resend } from "resend";
import { renderFamilyDrillEmail } from "./family-drill-email";

type ResendClient = Pick<Resend, "emails">;

export type VerificationEmail = {
  identifier: string;
  url: string;
  from: string;
};

export function createResendVerificationEmailSender(client: ResendClient) {
  return async ({ identifier, url, from }: VerificationEmail) => {
    const { html, text } = renderFamilyDrillEmail({
      preheader: "Your one-time Family Drill sign-in link is inside.",
      heading: "Sign in to Family Drill",
      paragraphs: ["Tap the button below to verify your email and continue setting up your family's scam practice."],
      button: { label: "Verify email and sign in", url },
      footnote: "This link works once and expires in 24 hours. If you didn't ask to sign in, you can safely ignore this email.",
    });
    const { error } = await client.emails.send({ from, to: identifier, subject: "Sign in to Family Drill", text, html });

    if (error) throw new Error(`Resend failed to send organizer verification email: ${error.message}`);
  };
}

export async function sendAuthVerificationEmail(message: VerificationEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is required to send organizer verification emails in production");
    }
    console.log(`[auth:magic-link] To: ${message.identifier} | ${message.url} | From: ${message.from}`);
    return;
  }

  await createResendVerificationEmailSender(new Resend(apiKey))(message);
}
