import type { Metadata } from "next";
import Link from "next/link";
import "./styles.css";

export const metadata: Metadata = {
  title: "Family Drill",
  description: "Household-agreed surprise practice for spotting suspicious email.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header><Link href="/" className="brand">Family Drill</Link><nav><Link href="/household">Household</Link> · <Link href="/admin">Admin</Link></nav></header>
        <main>{children}</main>
        <footer>Fictional practice only. No credentials are ever requested.</footer>
      </body>
    </html>
  );
}
