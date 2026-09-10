import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./styles.css";

export const metadata: Metadata = {
  title: "Family Drill | Practice the scam before the real one hits",
  description: "Bot-run scam drills with fictional messages and instant coaching.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header><Link href="/" className="brand"><Image src="/brand/house-icon.svg" alt="" width={34} height={34} /> Family Drill</Link><nav aria-label="Main navigation"><Link href="/docs/start">How it works</Link><Link className="nav-cta" href="/docs/bot">Install bot</Link></nav></header>
    <main>{children}</main>
    <footer><Link href="/" className="brand"><Image src="/brand/house-icon.svg" alt="" width={34} height={34} /> Family Drill</Link><p>Surprise scam drills for your family.</p><nav aria-label="Footer navigation"><a href="https://github.com/ajaysurie/family-drill">GitHub</a><Link href="/docs/start">Docs</Link><Link href="/docs/privacy">Privacy</Link><Link href="/docs/contact">Contact</Link><Link href="/household">Household demo</Link><Link href="/admin">Admin demo</Link></nav><small>MIT licensed. Fictional practice only. No credentials.</small></footer>
  </body></html>;
}
