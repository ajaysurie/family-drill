import Link from "next/link";
import { getHousehold, getMembers, getReport, scenarios } from "../../lib/store";
import { sendDrill } from "./actions";
import { auth } from "../../auth";
import { redirect } from "next/navigation";
import { logOut } from "../login/actions";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ sendError?: string; sent?: string }> }) {
  const session = await auth(); if (!session?.user?.id) redirect("/login");
  const status = await searchParams;
  const household = await getHousehold(session.user.id); if (!household) redirect("/login");
  const members = await getMembers(session.user.id);
  const reports = new Map(await Promise.all(members.map(async (member) => [member.id, await getReport(session.user!.id!, member.id)] as const)));
  return <section><span className="eyebrow">Organizer tool</span><h1>Drill report</h1>
    <div className="legacy-notice"><div><strong>Review and send drills here when you need to.</strong><p>The Family Drill bot remains the primary path for adding family members and running drills; this dashboard is an optional organizer tool.</p></div><Link className="button" href="/docs/bot">See bot setup →</Link></div>
    <p>The household agreement is <b>{household.status}</b>. <Link href="/household">View the agreement and family members</Link>.</p>
    {status.sendError && <p className="notice" role="alert">{status.sendError}</p>}
    {status.sent === "1" && <p className="notice" role="status">Drill sent.</p>}
    <div className="table">
      {members.map((member) => { const report = reports.get(member.id)!; return <article className="row" key={member.id}>
        <div><h2>{member.name}</h2><p>{member.email}</p></div>
        <div><b>{report.sent}</b><small> sent</small></div><div><b>{report.lureEngagements}</b><small> lure engagements</small></div>
        {household.status === "active" ? <form action={sendDrill}><input type="hidden" name="memberId" value={member.id}/><select name="scenarioId" aria-label={`Scenario for ${member.name}`}>{scenarios.map((scenario) => <option value={scenario.id} key={scenario.id}>{scenario.subject}</option>)}</select><button className="secondary">Send drill</button></form> : <span>Activate the household agreement first.</span>}
      </article>; })}
    </div>
    <form action={logOut}><button className="secondary">Sign out</button></form>
  </section>;
}
