// Only same-site paths are allowed after sign-in, so the login form can't be used as an open redirect.
export const safeNext = (next: unknown) => typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/install";
