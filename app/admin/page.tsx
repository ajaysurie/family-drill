import Link from "next/link";
import { getFamilyReport, getHousehold, scenarios } from "../../lib/store";
import { sendDrill } from "./actions";
import { auth } from "../../auth";
import { redirect } from "next/navigation";
import { logOut } from "../login/actions";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ sendError?: string; sent?: string }> }) {
  const session = await auth(); if (!session?.user?.id) redirect("/login");
  const status = await searchParams;
  const household = await getHousehold(session.user.id); if (!household) redirect("/login");
  const report = await getFamilyReport(session.user.id);
  return <section><span className="eyebrow">Organizer tool</span><h1>Drill report</h1>
    <div className="legacy-notice"><div><strong>Review and send drills here when you need to.</strong><p>Your assistant is the main way to add family members and send drills. This dashboard is an optional organizer tool.</p></div><Link className="button" href="/docs/bot">See bot setup →</Link></div>
    <p>The household agreement is <b>{household.status}</b>. <Link href="/household">View the agreement and family members</Link>.</p>
    {status.sendError && <p className="notice" role="alert">{status.sendError}</p>}
    {status.sent === "1" && <p className="notice" role="status">Drill sent.</p>}
    <div className="table">
      {report.map((member) => <article className="row" key={member.memberId}>
        <div><h2>{member.name}</h2><p>{member.lastDrill ? `Last: ${member.lastDrill.scenarioLabel} (${member.lastDrill.outcome})` : "No drills yet"}</p></div>
        <div><b>{member.drillsSent}</b><small> sent</small></div><div><b>{member.clicked}</b><small> clicked</small> · <b>{member.reported}</b><small> reported</small></div>
        {household.status === "active" ? <form action={sendDrill}><input type="hidden" name="memberId" value={member.memberId}/><select name="scenarioId" aria-label={`Scenario for ${member.name}`}><option value="surprise">Surprise me</option>{scenarios.map((scenario) => <option value={scenario.id} key={scenario.id}>{scenario.subject}</option>)}</select><button className="secondary">Send drill</button></form> : <span>Activate the household agreement first.</span>}
      </article>)}
    </div>
    <form action={logOut}><button className="secondary">Sign out</button></form>
  </section>;
}
