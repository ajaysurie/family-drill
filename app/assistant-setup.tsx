"use client";

import { useState } from "react";
import { BOT_INSTALL_URL } from "../lib/bot-install";
import { CopyBlock } from "./copy-button";

type Assistant = "grok" | "muse" | "other";
const tabs: [Assistant, string][] = [["grok", "Grok Bot"], ["muse", "Meta Muse"], ["other", "Other assistants"]];

export const setupMessage = (appUrl: string, code: string) => `Help me set up Family Drill, a safe scam-practice program for my family.
Read and follow the guide at ${appUrl}/agent.md
My Family Drill install code is: ${code}
Save the code as a secret and don't repeat it back to me. Then call get_status and walk me through setup one question at a time.`;

// With a real code this renders ready-to-paste values; without one it shows placeholders for the docs.
export function AssistantSetup({ appUrl, code }: { appUrl: string; code?: string }) {
  const [active, setActive] = useState<Assistant>("grok");
  const shown = code ?? "YOUR-INSTALL-CODE";
  const connectorUrl = `${appUrl}/api/mcp/${shown}`;
  const message = <><p className="step-label">Paste this message into a new chat</p><CopyBlock value={setupMessage(appUrl, shown)} label="Copy message" /></>;
  const connector = <><p className="step-label">Connector URL (keep it private, it contains your code)</p><CopyBlock value={connectorUrl} label="Copy URL" /></>;

  return <div className="assistant-setup">
    <div className="tabs" role="tablist" aria-label="Choose your assistant">
      {tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={active === id} className={active === id ? "tab active" : "tab"} onClick={() => setActive(id)}>{label}</button>)}
    </div>
    {active === "grok" && <div role="tabpanel" className="tab-panel">
      <ol className="setup-list">
        <li><strong>Add the Family Drill bot.</strong> Open the <a href={BOT_INSTALL_URL}>Family Drill bot for Grok</a> and add it to your account.</li>
        <li><strong>Recommended: add the connector.</strong> In Grok's connectors settings, add a custom MCP server and paste the connector URL below. This gives the bot a direct, reliable line to Family Drill.{connector}</li>
        <li><strong>Start a chat with the bot.</strong> Paste the message below. The bot will save your code and walk you through adding your family.{message}</li>
      </ol>
    </div>}
    {active === "muse" && <div role="tabpanel" className="tab-panel">
      <ol className="setup-list">
        <li><strong>Add a custom connector.</strong> In Muse, open Settings, then Connectors, and add a custom connector with the URL below. If you don't see that option, skip this step: Muse can build the connection itself from the guide.{connector}</li>
        <li><strong>Start a new chat.</strong> Paste the message below. If Muse offers a secure field for credentials, put the install code there instead of in the chat.{message}</li>
        <li><strong>Optional: make it a routine.</strong> Ask Muse to "send one surprise Family Drill every other week and give me a short recap on Sundays."</li>
      </ol>
    </div>}
    {active === "other" && <div role="tabpanel" className="tab-panel">
      <ol className="setup-list">
        <li><strong>Any assistant with MCP support</strong> (Claude, ChatGPT, Cursor, and others): add a remote MCP server with the connector URL below.{connector}</li>
        <li><strong>Assistants without MCP</strong> can call the same tools over HTTPS. Paste the message below and the assistant will read the guide.{message}</li>
        <li><strong>Building your own?</strong> See the <a href="/agent.md">assistant guide</a> and the <a href="/openapi.json">OpenAPI spec</a>.</li>
      </ol>
    </div>}
  </div>;
}
