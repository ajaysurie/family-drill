import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { createTransport } from "nodemailer";
import { db } from "./lib/db";
import { accounts, householdAgreements, organizers, sessions, verificationTokens } from "./lib/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, { usersTable: organizers, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens }),
  pages: { signIn: "/login", verifyRequest: "/login/check-email" },
  providers: [Nodemailer({
    server: process.env.EMAIL_SERVER ?? "smtp://localhost:1025",
    from: process.env.EMAIL_FROM ?? "Family Drill <login@localhost>",
    async sendVerificationRequest({ identifier, url, provider }) {
      if (!process.env.EMAIL_SERVER) {
        if (process.env.NODE_ENV === "production") throw new Error("EMAIL_SERVER is required in production");
        console.log(`[auth:magic-link] To: ${identifier} | ${url}`);
        return;
      }
      await createTransport(provider.server).sendMail({ to: identifier, from: provider.from, subject: "Sign in to Family Drill", text: `Sign in to Family Drill:\n${url}\n\nIf you did not request this, ignore this email.` });
    },
  })],
  events: {
    async createUser({ user }) {
      await db.insert(householdAgreements).values({ organizerId: user.id!, termsVersion: "2026-09-01" });
    },
  },
  callbacks: {
    authorized({ auth: session, request }) {
      const gated = request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/household");
      return !gated || Boolean(session?.user);
    },
  },
});
