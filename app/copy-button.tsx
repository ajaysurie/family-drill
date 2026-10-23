"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }
  return <button type="button" className="copy-button" onClick={copy}>{copied ? "Copied" : label}</button>;
}

export function CopyBlock({ value, label }: { value: string; label?: string }) {
  return <div className="copy-block"><pre>{value}</pre><CopyButton value={value} label={label} /></div>;
}
