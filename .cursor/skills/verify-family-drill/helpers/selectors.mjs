export const selectors = Object.freeze({
  adminRows: ".table .row",
  sentCount: "div:nth-of-type(2) b",
  sendButton: "button",
  deliberateButton: "button",
  notice: ".notice"
});

export function classifyHtml(html) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return {
    hasFamilyLanguage: /family drill|household/i.test(text),
    hasCredentialField: /<input\b[^>]*(?:type=["']?(?:password|email)["']?|name=["']?(?:password|passcode|username|email|credential)["']?)/i.test(html)
  };
}
