import Link from "next/link";
import { getHousehold, getMembers, getReport, scenarios } from "../../lib/store";
import { sendDrill } from "./actions";
import { auth } from "../../auth";
import { redirect } from "next/navigation";
import { logOut } from "../login/actions";

export default async function AdminPage() {
  const session = await auth(); if (!session?.user?.id) redirect("/login");
  const household = await getHousehold(session.user.id); if (!household) redirect("/login");
  const members = await getMembers(session.user.id);
  const reports = new Map(await Promise.all(members.map(async (member) => [member.id, await getReport(session.user!.id!, member.id)] as const)));
  return <section><span className="eyebrow">Organizer tools · not the daily product</span><h1>Family drill report</h1>
    <p>The household agreement is <b>{household.status}</b>. Drill mail is written only to the server console. <Link href="/household">View the agreement and members</Link>.</p>

    <div className="table">
      {members.map((member) => { const report = reports.get(member.id)!; return <article className="row" key={member.id}>
        <div><h2>{member.name}</h2><p>{member.email}</p></div>
        <div><b>{report.sent}</b><small> sent</small></div><div><b>{report.lureEngagements}</b><small> lure engagements</small></div>
        {household.status === "active" ? <form action={sendDrill}><input type="hidden" name="memberId" value={member.id}/><select name="scenarioId" aria-label={`Scenario for ${member.name}`}>{scenarios.map((scenario) => <option value={scenario.id} key={scenario.id}>{scenario.subject}</option>)}</select><button>Send surprise drill</button></form> : <span>Activate the household agreement first.</span>}
      </article>; })}
    </div>
    <form action={logOut}><button className="secondary">Sign out</button></form>
  </section>;
}
