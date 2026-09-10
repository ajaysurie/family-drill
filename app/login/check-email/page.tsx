import Link from "next/link";

export default function CheckEmailPage() { return <section className="card login"><span className="eyebrow">Check your email</span><h1>Your sign-in link is on its way.</h1><p>Use the link in the message to open your organizer dashboard. You can close this page.</p><Link href="/">Return home</Link></section>; }
