import { getParticipants, getReport, scenarios } from "../../lib/store";
import { sendDrill } from "./actions";

export default function AdminPage() {
  return <section><span className="eyebrow">Local demo</span><h1>Family drill report</h1><p>Only opted-in relatives can receive a drill. Sending uses the console mail adapter.</p>
    <div className="table">
      {getParticipants().map((participant) => { const report = getReport(participant.id); return <article className="row" key={participant.id}>
        <div><h2>{participant.name}</h2><p>{participant.email}</p></div>
        <span className={`pill ${participant.consent.status}`}>{participant.consent.status}</span>
        <div><b>{report.sent}</b><small> sent</small></div><div><b>{report.deliberateClicks}</b><small> deliberate</small></div>
        {participant.consent.status === "accepted" ? <form action={sendDrill}><input type="hidden" name="participantId" value={participant.id}/><select name="scenarioId" aria-label={`Scenario for ${participant.name}`}>{scenarios.map((s) => <option value={s.id} key={s.id}>{s.subject}</option>)}</select><button>Send drill</button></form> : <a href={`/invite/${participant.inviteToken}`}>Open invite</a>}
      </article>; })}
    </div>
  </section>;
}
