import Link from "next/link";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <div className="docs-shell"><aside><span className="eyebrow">Field guide</span><h2>Family Drill docs</h2><nav><Link href="/docs/start">Ways to start</Link><Link href="/docs/safety">Safety &amp; AUP</Link><Link href="/docs/bot">Grok Bot</Link></nav></aside><article className="docs-content">{children}</article></div>;
}
