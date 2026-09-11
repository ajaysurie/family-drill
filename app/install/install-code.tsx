"use client";

import { useState } from "react";

export function InstallCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
  }

  return <div className="install-code"><code>{code}</code><button type="button" onClick={copyCode}>{copied ? "Copied" : "Copy"}</button></div>;
}
