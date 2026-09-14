import { Resend } from "resend";

type ResendClient = Pick<Resend, "emails">;

export type VerificationEmail = {
  identifier: string;
  url: string;
  from: string;
};

export function createResendVerificationEmailSender(client: ResendClient) {
  return async ({ identifier, url, from }: VerificationEmail) => {
    const { error } = await client.emails.send({
      from,
      to: identifier,
      subject: "Sign in to Family Drill",
      text: `Sign in to Family Drill:\n\n${url}\n\nIf you did not request this email, you can ignore it.`,
      html: `<p>Sign in to Family Drill:</p><p><a href="${url}">Verify your email and continue</a></p><p>If you did not request this email, you can ignore it.</p>`,
    });

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
