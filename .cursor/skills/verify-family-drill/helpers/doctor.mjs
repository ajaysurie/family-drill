import { request, baseUrl } from "./lib.mjs";
import { classifyHtml } from "./selectors.mjs";

let failed = false;
for (const path of ["/", "/household", "/admin", "/d/drill-leo"]) {
  try {
    const response = await request(path);
    const html = await response.text();
    const classification = classifyHtml(html);
    const credentialSafe = path.startsWith("/d/") ? !classification.hasCredentialField : true;
    const ok = response.status === 200 && classification.hasFamilyLanguage && credentialSafe;
    console.log(`${ok ? "PASS" : "FAIL"} ${path}: HTTP ${response.status}, family language ${classification.hasFamilyLanguage ? "yes" : "no"}${path.startsWith("/d/") ? `, credential fields ${classification.hasCredentialField ? "found" : "none"}` : ""}`);
    failed ||= !ok;
  } catch (error) { console.log(`FAIL ${path}: ${error.message}`); failed = true; }
}
for (const path of ["/docs/start", "/docs/safety", "/docs/bot"]) {
  try {
    const response = await request(path);
    if (response.status === 404) { console.log(`SKIP ${path}: route not present`); continue; }
    const html = await response.text(); const ok = response.status === 200 && classifyHtml(html).hasFamilyLanguage;
    console.log(`${ok ? "PASS" : "FAIL"} ${path}: HTTP ${response.status}`); failed ||= !ok;
  } catch (error) { console.log(`FAIL ${path}: ${error.message}`); failed = true; }
}
if (failed) { console.error(`Doctor failed against ${baseUrl}`); process.exit(1); }
console.log(`Doctor passed against ${baseUrl}`);
