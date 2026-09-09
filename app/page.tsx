import Link from "next/link";

export default function Home() {
  return <>
    <section className="hero">
      <span className="eyebrow">Agree once. Practice kindly.</span>
      <h1>Safe surprise drills for the whole family.</h1>
      <p>Your household agrees up front, then members receive occasional fictional email drills without knowing which message is next. When someone engages, the reveal teaches the clues immediately and helps family coach without shame.</p>
      <div className="actions"><Link className="button" href="/household">View household agreement</Link><Link className="button secondary" href="/admin">Open the admin demo</Link></div>
    </section>
    <section className="grid">
      <article><strong>1</strong><h2>Set the agreement</h2><p>Everyone understands surprise practice, safety boundaries, kind coaching, and the right to stop.</p></article>
      <article><strong>2</strong><h2>Send a safe surprise</h2><p>Fictional organizations only—never covert real phishing, brand impersonation, credential requests, or downloads.</p></article>
      <article><strong>3</strong><h2>Reveal and coach</h2><p>The destination reveals the drill immediately. Only an explicit confirmation counts as engagement; page loads and scanners do not.</p></article>
    </section>
  </>;
}
