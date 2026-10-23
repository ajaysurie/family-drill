import { brands } from "./brands";
import { HERO_SIZE, LOGO_HEIGHT, heroPath, logoPath, logoWidth } from "./email-assets";
import type { Member, Scenario } from "./types";

export type RenderedDrillEmail = { fromName: string; to: string; subject: string; text: string; html: string };
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MUTED = "#6b7280", RULE = "#e5e7eb";

const button = (label: string, url: string, color: string, align = "left") => `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="${align}" style="margin:28px 0 8px"><tr><td bgcolor="${color}" style="border-radius:8px"><a href="${escapeHtml(url)}" style="display:inline-block;padding:15px 30px;font-family:${FONT};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px">${escapeHtml(label)}</a></td></tr></table>`;
const paragraph = (text: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#1f2937">${escapeHtml(text)}</p>`;
const keyValueTable = (rows: [string, string][], strongLast = false) => `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0 4px;border:1px solid ${RULE};border-radius:8px;border-collapse:separate">${rows.map(([label, value], index) => { const strong = strongLast && index === rows.length - 1; return `<tr><td style="padding:13px 16px;font-size:14px;color:${strong ? "#111827" : MUTED};${strong ? "font-weight:700;" : ""}${index ? `border-top:1px solid ${RULE};` : ""}">${escapeHtml(label)}</td><td align="right" style="padding:13px 16px;font-size:14px;color:#111827;font-weight:${strong ? 800 : 600};${index ? `border-top:1px solid ${RULE};` : ""}">${escapeHtml(value)}</td></tr>`; }).join("")}</table>`;

function layoutBody(s: Scenario, url: string, greeting: string, copy: string) {
  const b = brands[s.brandId];
  const reference: [string, string][] = s.reference ? [[s.reference.label, s.reference.value]] : [];
  if (s.layoutId === "cta-hero") return `<td align="center" style="padding:36px 40px 30px;text-align:center"><h1 style="margin:0 0 18px;font-size:26px;line-height:1.25;color:#111827">${escapeHtml(s.subject)}</h1>${greeting}${copy}${button(s.ctaLabel ?? "View details", url, b.primary, "center")}<p style="clear:both;margin:14px 0 0;font-size:13px;color:${MUTED}">It only takes a minute.</p></td>`;
  if (s.layoutId === "security-banner") return `<td style="padding:34px 40px 30px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 22px"><tr><td style="padding:14px 16px;background:#fef2f2;border-left:4px solid #dc2626;border-radius:4px;font-size:14px;line-height:1.5;color:#7f1d1d"><strong>Action required:</strong> ${escapeHtml(s.preheader ?? s.preview)}</td></tr></table>${greeting}${copy}${keyValueTable([...reference, ["Status", s.heroCaption], ["Detected", "Today"]])}${button(s.ctaLabel ?? "Review now", url, b.primary)}<p style="clear:both;margin:18px 0 0;font-size:13px;line-height:1.5;color:${MUTED}">If you do not respond, we may limit access to protect your account.</p></td>`;
  if (s.layoutId === "receipt-table") return `<td style="padding:34px 40px 30px"><p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${b.primary}">${escapeHtml(s.heroTitle)}</p><h1 style="margin:0 0 20px;font-size:24px;line-height:1.3;color:#111827">${escapeHtml(s.subject)}</h1>${greeting}${copy}${keyValueTable([...reference, ...(s.lineItems ?? []).map((item): [string, string] => [item.label, item.amount])], Boolean(s.lineItems?.length))}${button(s.ctaLabel ?? "View invoice", url, b.primary)}</td>`;
  const steps = ["Received", "In transit", s.heroTitle];
  const tracker = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0 6px"><tr>${steps.map((step, index) => `<td width="33%" valign="top" style="padding:0 4px"><div style="height:6px;border-radius:3px;background:${index < 2 ? b.primary : "#f59e0b"}"></div><p style="margin:9px 0 0;font-size:12px;line-height:1.35;font-weight:${index === 2 ? 700 : 500};color:${index === 2 ? "#92400e" : MUTED}">${escapeHtml(step)}</p></td>`).join("")}</tr></table>`;
  return `<td style="padding:34px 40px 30px"><h1 style="margin:0 0 20px;font-size:24px;line-height:1.3;color:#111827">${escapeHtml(s.subject)}</h1>${greeting}${copy}${tracker}${reference.length ? keyValueTable(reference) : ""}${button(s.ctaLabel ?? "View details", url, b.primary)}</td>`;
}

// `assetBase` is the absolute app origin for real mail, or "" for in-site previews.
export function renderDrillEmail(s: Scenario, member: Member, url: string, assetBase: string): RenderedDrillEmail {
  const b = brands[s.brandId], paragraphs = s.bodyParagraphs ?? [], footerLines = s.footerLines ?? [];
  const greeting = paragraph(`Hello ${member.name},`);
  const copy = paragraphs.map(paragraph).join("");
  const preheader = escapeHtml(s.preheader ?? s.preview) + "&nbsp;&zwnj;".repeat(60);
  const logo = `<img src="${assetBase}${logoPath(s.brandId)}" width="${logoWidth(b.name)}" height="${LOGO_HEIGHT}" alt="${escapeHtml(b.name)}" style="display:block;border:0;font-size:20px;font-weight:800;color:${b.primary}">`;
  const hero = `<img data-layout-hero="${s.layoutId}" src="${assetBase}${heroPath(s.id)}" width="${HERO_SIZE.width}" height="${HERO_SIZE.height}" alt="${escapeHtml(`${s.heroTitle}. ${s.heroCaption}`)}" style="display:block;width:100%;max-width:${HERO_SIZE.width}px;height:auto;border:0;font-size:18px;font-weight:700;color:#ffffff">`;
  const meta = s.reference ? `<td align="right" style="font-size:12px;line-height:1.4;color:${MUTED}">${escapeHtml(s.reference.label)}<br><strong style="color:#111827">${escapeHtml(s.reference.value)}</strong></td>` : "";
  const footerLink = (label: string) => `<a href="${escapeHtml(url)}" style="color:${MUTED};text-decoration:underline">${label}</a>`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${escapeHtml(s.subject)}</title></head>`
    + `<body style="margin:0;padding:0;background:#f3f4f6;font-family:${FONT};color:#1f2937"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>`
    + `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f3f4f6"><tr><td align="center" style="padding:28px 12px">`
    + `<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid ${RULE};border-radius:12px;overflow:hidden;font-family:${FONT}">`
    + `<tr><td style="padding:20px 32px;border-top:4px solid ${b.primary}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td>${logo}</td>${meta}</tr></table></td></tr>`
    + `<tr><td bgcolor="${b.primary}">${hero}</td></tr>`
    + `<tr>${layoutBody(s, url, greeting, copy)}</tr>`
    + `<tr><td style="padding:22px 40px 28px;background:#f9fafb;border-top:1px solid ${RULE};font-size:12px;line-height:1.6;color:${MUTED}">`
    + `<p style="margin:0 0 10px">${footerLines.map(escapeHtml).join("<br>")}</p>`
    + `<p style="margin:0 0 10px">${footerLink("Help Center")} &nbsp;·&nbsp; ${footerLink("Privacy Policy")} &nbsp;·&nbsp; ${footerLink("Notification settings")}</p>`
    + `<p style="margin:0">© ${new Date().getFullYear()} ${escapeHtml(b.legalName)}. This is an automated message, please do not reply.</p>`
    + `</td></tr></table></td></tr></table></body></html>`;
  const text = [`${b.name}`, s.subject, `Hello ${member.name},`, ...paragraphs, ...(s.reference ? [`${s.reference.label}: ${s.reference.value}`] : []), ...(s.lineItems ?? []).map((item) => `${item.label}: ${item.amount}`), `${s.ctaLabel ?? "View details"}: ${url}`, ...footerLines].join("\n\n");
  return { fromName: s.fromName, to: member.email, subject: s.subject, text, html };
}
