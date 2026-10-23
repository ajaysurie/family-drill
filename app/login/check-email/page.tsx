import Link from "next/link";

export default function CheckEmailPage() { return <section className="card login"><span className="eyebrow">Check your email</span><h1>Your sign-in link is on its way.</h1><p>Open the link in the email to get your install code. You can close this page.</p><Link href="/">Return home</Link></section>; }
