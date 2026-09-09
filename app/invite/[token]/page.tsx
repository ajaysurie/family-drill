import { notFound } from "next/navigation";
import { findInvite } from "../../../lib/store";
import { accept } from "./actions";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params; const participant = findInvite(token); if (!participant) notFound();
  const accepted = participant.consent.status === "accepted";
  return <section className="card"><span className="eyebrow">Your choice</span><h1>{accepted ? `You’re opted in, ${participant.name}.` : `${participant.name}, want to practice together?`}</h1>
    <p>Family Drill sends occasional fictional email examples to help you recognize suspicious messages. They never ask for private information. Your organizer will see whether you deliberately confirm following a link—not email opens.</p>
    {accepted ? <p className="notice">Consent accepted. You can ask your organizer to stop at any time.</p> : <form action={accept.bind(null, token)}><button>I agree to receive practice drills</button></form>}
  </section>;
}
