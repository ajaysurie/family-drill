import type { Metadata } from "next";
import Link from "next/link";
import "./styles.css";

export const metadata: Metadata = {
  title: "Family Drill | Practice the scam before the real one hits",
  description: "Fictional surprise scam drills for your household.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header><Link href="/" className="brand"><span>FD</span> Family Drill</Link><nav aria-label="Main navigation"><Link href="/docs/start">Docs</Link><Link href="/household">Household</Link><Link href="/admin">Admin</Link></nav></header>
    <main>{children}</main>
    <footer><Link href="/" className="brand"><span>FD</span> Family Drill</Link><p>Surprise scam drills for your household.</p><nav aria-label="Footer navigation"><a href="https://github.com/ajaysurie/family-drill">GitHub</a><Link href="/docs/start">Docs</Link><Link href="/docs/privacy">Privacy</Link><Link href="/docs/contact">Contact</Link></nav><small>MIT licensed. Fictional practice only. No credentials.</small></footer>
  </body></html>;
}
