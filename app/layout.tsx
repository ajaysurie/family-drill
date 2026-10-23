import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { appBaseUrl } from "../lib/email-assets";
import "./styles.css";

const description = "Your AI assistant sends your family safe, surprise scam-practice emails. Every company is invented, nothing is collected, and every click opens a short lesson.";

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl()),
  title: "Family Drill | Practice the scam before the real one hits",
  description,
  icons: { icon: "/brand/house-icon.svg" },
  openGraph: { title: "Family Drill: practice the scam before the real one hits", description, siteName: "Family Drill", type: "website" },
  twitter: { card: "summary_large_image", title: "Family Drill: practice the scam before the real one hits", description },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header><Link href="/" className="brand"><Image src="/brand/house-icon.svg" alt="" width={34} height={34} /> Family Drill</Link><nav aria-label="Main navigation"><Link href="/#how">How it works</Link><Link href="/examples">Practice emails</Link><Link href="/learn">Teach your family</Link><Link href="/login">Organizer sign in</Link><Link className="nav-cta" href="/docs/bot">Get started</Link></nav></header>
    <main>{children}</main>
    <footer><Link href="/" className="brand"><Image src="/brand/house-icon.svg" alt="" width={34} height={34} /> Family Drill</Link><p>Safe, surprise scam practice for your family.</p><nav aria-label="Footer navigation"><Link href="/docs/bot">Connect your assistant</Link><Link href="/learn">Teach your family</Link><Link href="/docs/safety">Safety</Link><Link href="/docs/privacy">Privacy</Link><Link href="/docs/contact">Contact</Link><a href="https://github.com/ajaysurie/family-drill">GitHub</a></nav><small>MIT licensed. Fictional practice only. No credentials collected.</small></footer>
    <Analytics />
    <SpeedInsights />
  </body></html>;
}
