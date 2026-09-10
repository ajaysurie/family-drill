import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./lib/db";
import { accounts, householdAgreements, organizers, sessions, verificationTokens } from "./lib/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, { usersTable: organizers, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens }),
  pages: { signIn: "/login", verifyRequest: "/login/check-email" },
  providers: [Nodemailer({
    server: process.env.EMAIL_SERVER ?? "smtp://localhost:1025",
    from: process.env.EMAIL_FROM ?? "Family Drill <login@localhost>",
    async sendVerificationRequest({ identifier, url, provider }) {
      console.log(`[auth:magic-link] To: ${identifier} | ${url} | From: ${provider.from}`);
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
