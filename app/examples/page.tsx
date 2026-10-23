import Link from "next/link";
import { brands } from "../../lib/brands";
import { categoryLabels } from "../../lib/drill-planning";
import { heroPath } from "../../lib/email-assets";
import scenarios from "../../lib/scenarios.json";
import type { Scenario } from "../../lib/types";

export const metadata = { title: "Practice emails | Family Drill", description: "Every Family Drill practice email: realistic scam tactics from invented companies, each with a lesson." };

export default function ExamplesPage() {
  return <section className="examples-page">
    <span className="eyebrow">Practice emails</span>
    <h1>Real tactics. Invented companies.</h1>
    <p className="lede">Each practice email copies a scam that is circulating today, sent from a company that doesn&apos;t exist. Open any one to see the full email and the lesson your family gets after a click.</p>
    <div className="example-grid">{(scenarios as Scenario[]).map((scenario) => <Link className="example-card" href={`/examples/${scenario.id}`} key={scenario.id}>
      <img src={heroPath(scenario.id)} alt="" width={600} height={225} loading="lazy" />
      <div><span className="tag">{categoryLabels[scenario.category]}</span><strong>{scenario.fromName}</strong><h2>{scenario.subject}</h2><p>{scenario.lesson[0]}</p><span className="text-link">See the email and lesson →</span></div>
      <span className="sr-only">{brands[scenario.brandId].name}</span>
    </Link>)}</div>
  </section>;
}
