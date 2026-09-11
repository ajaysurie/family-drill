import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

let source = await readFile(new URL("../lib/render-drill-email.ts", import.meta.url), "utf8");
let brandSource = await readFile(new URL("../lib/brands.ts", import.meta.url), "utf8");
brandSource = brandSource.replace(/import type[^;]+;/g, "").replace(/export /g, "");
source = source.replace(/import \{ brandMark, brands \} from "\.\/brands";/, brandSource);
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { renderDrillEmail } = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
const scenarios = JSON.parse(await readFile(new URL("../lib/scenarios.json", import.meta.url), "utf8"));
const member = { id: "member-1", name: "Maya", email: "maya@example.test", householdId: "home-1" };
const forbiddenLureWords = /\b(?:fictional|practice|drill|Family Drill|scenario|coaching|lesson)\b/i;

for (const id of ["parcel-redelivery", "payment-failed", "stream-renewal", "virus-warning"]) {
  test(`renders a safe, complete ${id} message`, () => {
    const scenario = scenarios.find((item) => item.id === id);
    const revealUrl = `https://family.example.test/d/token-${id}`;
    const message = renderDrillEmail(scenario, member, revealUrl);
    assert.doesNotMatch([scenario.preview, scenario.preheader, ...scenario.bodyParagraphs, ...scenario.footerLines, scenario.ctaLabel].join(" "), forbiddenLureWords);
    assert.match(message.text, new RegExp(revealUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(message.html, new RegExp(revealUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.equal(message.from, `${scenario.fromName} <${scenario.fromLocalPart}@${scenario.fromDomain}>`);
  });
}

test("layout archetypes render distinct HTML", () => { const rendered = ["parcel-redelivery","payment-failed","stream-renewal","virus-warning"].map(id => renderDrillEmail(scenarios.find(s=>s.id===id), member, "https://example.test/d/x").html); assert.equal(new Set(rendered).size, 4); });
