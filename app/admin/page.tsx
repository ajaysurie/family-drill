import Link from "next/link";
import { getHousehold, getMembers, getReport, scenarios } from "../../lib/store";
import { sendDrill } from "./actions";

export default function AdminPage() {
  const household = getHousehold();
  return <section><span className="eyebrow">Local demo</span><h1>Family drill report</h1>
    <p>The household agreement is <b>{household.status}</b>. This demo sends mail only to the console. <Link href="/household">View the agreement and members</Link>.</p>
    <div className="table">
      {getMembers().map((member) => { const report = getReport(member.id); return <article className="row" key={member.id}>
        <div><h2>{member.name}</h2><p>{member.email}</p></div>
        <div><b>{report.sent}</b><small> sent</small></div><div><b>{report.lureEngagements}</b><small> lure engagements</small></div>
        {household.status === "active" ? <form action={sendDrill}><input type="hidden" name="memberId" value={member.id}/><select name="scenarioId" aria-label={`Scenario for ${member.name}`}>{scenarios.map((scenario) => <option value={scenario.id} key={scenario.id}>{scenario.subject}</option>)}</select><button>Send surprise drill</button></form> : <span>Activate the household agreement first.</span>}
      </article>; })}
    </div>
  </section>;
}
