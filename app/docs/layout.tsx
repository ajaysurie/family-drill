import Link from "next/link";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <div className="docs-shell"><aside><span className="eyebrow">Documentation</span><nav><Link href="/docs/bot">Install the bot</Link><Link href="/docs/start">Hosted or self-hosted</Link><Link href="/docs/safety">Safety &amp; AUP</Link></nav></aside><article className="docs-content">{children}</article></div>;
}
