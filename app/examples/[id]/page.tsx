import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryLabels } from "../../../lib/drill-planning";
import { appBaseUrl } from "../../../lib/email-assets";
import { renderDrillEmail } from "../../../lib/render-drill-email";
import scenarioData from "../../../lib/scenarios.json";
import type { Scenario } from "../../../lib/types";
import { CluesList, NextTime, lessonClues } from "../../lesson";

const scenarios = scenarioData as Scenario[];
const SAMPLE_SENDER = "drills@familydrill.com";

export function generateStaticParams() { return scenarios.map((scenario) => ({ id: scenario.id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scenario = scenarios.find((item) => item.id === id);
  return scenario ? { title: `${scenario.subject} | Family Drill practice email`, description: scenario.lesson.join(" ") } : {};
}

export default async function ExamplePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scenario = scenarios.find((item) => item.id === id);
  if (!scenario) notFound();
  const email = renderDrillEmail(scenario, { id: "preview", name: "Ruth", email: "ruth@example.com", householdId: "preview" }, "#lesson", "");
  return <section className="example-detail">
    <Link href="/examples" className="text-link">← All practice emails</Link>
    <span className="eyebrow">{categoryLabels[scenario.category]}</span>
    <h1>{scenario.subject}</h1>
    <div className="inbox-line"><b>{scenario.fromName}</b> &lt;{SAMPLE_SENDER}&gt; <span>to Ruth</span></div>
    <div className="example-split">
      <iframe className="email-frame" title={`Practice email: ${scenario.subject}`} srcDoc={email.html} sandbox="" loading="lazy" />
      <div id="lesson"><span className="eyebrow">After a click</span><h2>What gave it away</h2><p>Ruth sees this lesson the moment she opens the link.</p><CluesList clues={lessonClues(scenario, SAMPLE_SENDER, new URL(appBaseUrl()).host)} /></div>
    </div>
    <NextTime />
  </section>;
}
