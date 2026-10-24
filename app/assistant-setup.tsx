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
  const privateUrl = `${appUrl}/api/mcp/${shown}`;
  const message = <><p className="step-label">Paste this message into a new chat</p><CopyBlock value={setupMessage(appUrl, shown)} label="Copy message" /></>;
  const connector = <>
    <p className="step-label">Connector URL</p><CopyBlock value={`${appUrl}/api/mcp`} label="Copy URL" />
    <p className="help">Your assistant opens a Family Drill page. Sign in with your email and choose Allow.</p>
    <details className="fallback"><summary>Assistant can&apos;t sign in?</summary><p className="help">Use this private URL instead. It contains your install code, so keep it to yourself.</p><CopyBlock value={privateUrl} label="Copy private URL" /></details>
  </>;

  return <div className="assistant-setup">
    <div className="tabs" role="tablist" aria-label="Choose your assistant">
      {tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={active === id} className={active === id ? "tab active" : "tab"} onClick={() => setActive(id)}>{label}</button>)}
    </div>
    {active === "grok" && <div role="tabpanel" className="tab-panel">
      <ol className="setup-list">
        <li><strong>Add the Family Drill bot.</strong> Open the <a href={BOT_INSTALL_URL}>Family Drill bot for Grok</a> and add it to your account.</li>
        <li><strong>Add the connector.</strong> We recommend this step. In Grok's connector settings, add a custom MCP server with the URL below and sign in when asked. The bot then calls Family Drill's tools directly instead of building its own web requests.{connector}</li>
        <li><strong>Start a chat with the bot.</strong> Paste the message below. The bot will save your code and walk you through adding your family.{message}</li>
      </ol>
    </div>}
    {active === "muse" && <div role="tabpanel" className="tab-panel">
      <ol className="setup-list">
        <li><strong>Add a custom connector.</strong> In Muse, open Settings, then Connectors, choose Add custom connector, and paste the URL below. Muse opens a Family Drill sign-in page. Choose Allow. If you don't see the option, skip this step, and Muse can build the connection itself from the guide.{connector}</li>
        <li><strong>Start a new chat.</strong> Paste the message below. If Muse offers a secure field for credentials, put the install code there instead of in the chat.{message}</li>
        <li><strong>Make it a routine.</strong> This step is optional. Ask Muse to "send one surprise Family Drill every other week and give me a short recap on Sundays."</li>
      </ol>
    </div>}
    {active === "other" && <div role="tabpanel" className="tab-panel">
      <ol className="setup-list">
        <li><strong>Assistants with MCP support</strong>, such as Claude, ChatGPT, and Cursor, can add a remote MCP server with the URL below and sign in when asked.{connector}</li>
        <li><strong>Assistants without MCP</strong> can call the same tools over HTTPS. Paste the message below and the assistant will read the guide.{message}</li>
        <li><strong>Building your own?</strong> See the <a href="/agent.md">assistant guide</a> and the <a href="/openapi.json">OpenAPI spec</a>.</li>
      </ol>
    </div>}
  </div>;
}
