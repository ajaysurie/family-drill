import type { Member, Scenario } from "./types";

export type RenderedDrillEmail = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[character]!);

export function renderDrillEmail(scenario: Scenario, member: Member, revealUrl: string): RenderedDrillEmail {
  const fromAddress = `${scenario.fromLocalPart ?? "alerts"}@${scenario.fromDomain ?? "notice.test"}`;
  const paragraphs = scenario.bodyParagraphs ?? [];
  const footerLines = scenario.footerLines ?? [];
  const ctaLabel = scenario.ctaLabel ?? "View details";
  const text = [
    `Hello ${member.name},`,
    ...paragraphs,
    `${ctaLabel}: ${revealUrl}`,
    ...footerLines
  ].join("\n\n");
  const body = scenario.bodyHtml ?? paragraphs.map((paragraph) => `<p style="margin:0 0 16px">${escapeHtml(paragraph)}</p>`).join("");
  const footer = footerLines.map((line) => escapeHtml(line)).join("<br>");
  const html = `<!doctype html><html><body style="margin:0;background:#f4f4f4;font-family:Arial,sans-serif;color:#242424"><span style="display:none;max-height:0;overflow:hidden">${escapeHtml(scenario.preheader ?? scenario.preview)}</span><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:100%;background:#fff;border:1px solid #ddd"><tr><td style="padding:30px"><p style="margin:0 0 16px">Hello ${escapeHtml(member.name)},</p>${body}<p style="margin:24px 0"><a href="${escapeHtml(revealUrl)}" style="display:inline-block;background:#1769aa;color:#fff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:4px">${escapeHtml(ctaLabel)}</a></p><p style="font-size:12px;color:#666;word-break:break-all">Or use this link:<br><a href="${escapeHtml(revealUrl)}">${escapeHtml(revealUrl)}</a></p></td></tr><tr><td style="border-top:1px solid #e5e5e5;padding:16px 30px;font-size:11px;line-height:1.5;color:#777">${footer}</td></tr></table></td></tr></table></body></html>`;

  return { from: `${scenario.fromName} <${fromAddress}>`, to: member.email, subject: scenario.subject, text, html };
}
