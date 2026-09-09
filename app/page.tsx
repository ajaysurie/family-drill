import Link from "next/link";

export default function Home() {
  return <>
    <section className="hero">
      <span className="eyebrow">Kind practice, not a gotcha</span>
      <h1>Help your family pause before a suspicious click.</h1>
      <p>Family Drill lets an organizer send clearly fictional email exercises only after a relative opts in. A click reveals the lesson immediately—never a login page.</p>
      <div className="actions"><Link className="button" href="/admin">Open the admin demo</Link><Link className="button secondary" href="/invite/invite-maya">Try the invitation</Link></div>
    </section>
    <section className="grid">
      <article><strong>1</strong><h2>Ask first</h2><p>Every participant accepts a plain-language invitation before drills begin.</p></article>
      <article><strong>2</strong><h2>Practice safely</h2><p>Emails use fictional organizations and link only to the local training reveal.</p></article>
      <article><strong>3</strong><h2>Learn, don’t shame</h2><p>Reports count an intentional confirmation, not invisible opens or scanner traffic.</p></article>
    </section>
  </>;
}
