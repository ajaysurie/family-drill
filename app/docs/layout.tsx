import Link from "next/link";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <div className="docs-shell"><aside><span className="eyebrow">Documentation</span><nav><Link href="/docs/bot">Connect your assistant</Link><Link href="/docs/start">Hosted or self-hosted</Link><Link href="/learn">Teach your family</Link><Link href="/examples">Practice emails</Link><Link href="/docs/safety">Safety &amp; AUP</Link><Link href="/docs/privacy">Privacy</Link><a href="/agent.md">Assistant guide</a></nav></aside><article className="docs-content">{children}</article></div>;
}
