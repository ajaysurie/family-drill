import { notFound } from "next/navigation";
import { findAttempt, scenarios } from "../../../lib/store";
import { confirm } from "./actions";

export default async function DrillPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ confirmed?: string }> }) {
  const { token } = await params; const attempt = await findAttempt(token); if (!attempt) notFound();
  const scenario = scenarios.find((s) => s.id === attempt.scenarioId)!; const confirmed = (await searchParams).confirmed === "1";
  return <section className="card reveal"><span className="eyebrow">This was a family drill</span><h1>Check the clues before the next message.</h1><p>Your household agreed to occasional fictional practice emails. This message did not impersonate a real organization or ask for private information.</p><p className="sample"><b>{scenario.fromName}</b><br/>{scenario.subject}<br/><small>{scenario.preview}</small></p>
    <ul>{scenario.lesson.map((item) => <li key={item}>{item}</li>)}</ul>
    <h2>Coach tips</h2><ul><li>"Messages like this try to rush people."</li><li>"Stop and check with me when a message seems odd."</li><li>"Let's look at the clues together."</li></ul>
    {confirmed ? <p className="notice">Lure engagement recorded. No private information was collected.</p> : <form action={confirm.bind(null, token)}><button>I opened this from the email</button><small className="help">Only this explicit button records a lure engagement. Loading this reveal does not.</small></form>}
  </section>;
}
