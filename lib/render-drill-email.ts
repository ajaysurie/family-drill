import { brandMark, brands } from "./brands";
import type { Member, Scenario } from "./types";

export type RenderedDrillEmail = { from: string; to: string; subject: string; text: string; html: string };
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const button = (s: Scenario, url: string) => `<a href="${escapeHtml(url)}" style="display:inline-block;background:${brands[s.brandId].primary};color:#fff;text-decoration:none;font-weight:bold;padding:14px 23px;border-radius:6px">${escapeHtml(s.ctaLabel ?? "View details")}</a>`;

// These table-based illustrations deliberately avoid remote or SVG images: both are
// inconsistently displayed by mail clients. Keep them simple, distinct, and inline.
const layoutHero = (layoutId: Scenario["layoutId"]) => {
  if (layoutId === "cta-hero") return `<table data-layout-hero="cta-hero" role="presentation" width="100%" cellspacing="0" style="background:#dff7ee"><tr><td align="center" style="padding:25px 18px"><div style="font-size:38px;line-height:1">◆</div><div style="margin-top:9px;font-size:13px;font-weight:bold;letter-spacing:2px;color:#174d3c">DEVICE CHECK</div></td></tr></table>`;
  if (layoutId === "security-banner") return `<table data-layout-hero="security-banner" role="presentation" width="100%" cellspacing="0" style="background:#351616;color:#fff"><tr><td width="84" align="center" style="padding:22px 0;font-size:36px">!</td><td style="padding:22px 22px 22px 0"><div style="font-size:12px;letter-spacing:2px;color:#ffb8ad">ACCOUNT ALERT</div><div style="margin-top:5px;font-size:20px;font-weight:bold">Review unusual activity</div></td></tr></table>`;
  if (layoutId === "receipt-table") return `<table data-layout-hero="receipt-table" role="presentation" width="100%" cellspacing="0" style="background:#f4f0e8"><tr><td align="center" style="padding:22px"><table role="presentation" cellspacing="0" style="width:176px;background:#fff;border:1px solid #d8d0c2"><tr><td style="padding:13px 16px;border-bottom:2px dashed #d8d0c2;font-size:12px;font-weight:bold">PAYMENT SUMMARY</td></tr><tr><td style="padding:12px 16px;color:#777;font-size:11px">ITEM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AMOUNT</td></tr></table></td></tr></table>`;
  return `<table data-layout-hero="tracking-card" role="presentation" width="100%" cellspacing="0" style="background:#e8f0ff"><tr><td style="padding:25px 28px"><div style="font-size:12px;font-weight:bold;letter-spacing:2px;color:#315582">PARCEL JOURNEY</div><table role="presentation" width="100%" cellspacing="0" style="margin-top:17px"><tr><td width="22" style="font-size:22px;color:#315582">●</td><td style="border-top:4px solid #315582">&nbsp;</td><td width="30" align="right" style="font-size:25px">□</td></tr></table></td></tr></table>`;
};

export function renderDrillEmail(s: Scenario, member: Member, url: string): RenderedDrillEmail {
  const b = brands[s.brandId], paragraphs = s.bodyParagraphs ?? [], footerLines = s.footerLines ?? [];
  const copy = paragraphs.map((p) => `<p style="margin:0 0 16px">${escapeHtml(p)}</p>`).join("");
  const greeting = `<p style="margin:0 0 16px">Hello ${escapeHtml(member.name)},</p>`;
  let content: string;
  if (s.layoutId === "cta-hero") content = `${layoutHero(s.layoutId)}<div style="padding:34px;text-align:center;background:${b.accent}">${brandMark(s.brandId)}<h1 style="font-size:28px;margin:28px 0 12px;color:${b.primary}">${escapeHtml(s.subject)}</h1>${greeting}${copy}<p style="margin:26px 0">${button(s,url)}</p></div>`;
  else if (s.layoutId === "security-banner") content = `${layoutHero(s.layoutId)}<div style="padding:30px;border-left:6px solid ${b.accent}">${brandMark(s.brandId)}<div style="height:20px"></div>${greeting}${copy}<p style="margin:24px 0">${button(s,url)}</p></div>`;
  else if (s.layoutId === "receipt-table") { const rows = (s.lineItems ?? [{label:"Monthly plan",amount:"$19.80"}]).map(i => `<tr><td style="padding:11px;border-bottom:1px solid #ddd">${escapeHtml(i.label)}</td><td align="right" style="padding:11px;border-bottom:1px solid #ddd">${escapeHtml(i.amount)}</td></tr>`).join(""); content = `${layoutHero(s.layoutId)}<div style="padding:28px">${brandMark(s.brandId)}<p style="font-size:12px;color:#666;text-transform:uppercase">Receipt notice</p>${greeting}${copy}<table width="100%" cellspacing="0" style="margin:20px 0;background:#fafafa">${rows}</table><p>${button(s,url)}</p></div>`; }
  else content = `${layoutHero(s.layoutId)}<div style="padding:28px">${brandMark(s.brandId)}<h1 style="font-size:24px;color:${b.primary}">${escapeHtml(s.subject)}</h1>${greeting}${copy}<table width="100%" style="margin:24px 0"><tr>${["Received","In transit","Delivery issue"].map((x,i)=>`<td align="center" style="border-top:5px solid ${i<2?b.primary:b.accent};padding-top:9px;font-size:12px">${x}</td>`).join("")}</tr></table><p>${button(s,url)}</p></div>`;
  const footer = footerLines.map(escapeHtml).join("<br>");
  const html = `<!doctype html><html><body style="margin:0;background:#eef0ee;font-family:Arial,sans-serif;color:#242424"><span style="display:none">${escapeHtml(s.preheader ?? s.preview)}</span><table role="presentation" width="100%"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="580" style="max-width:100%;background:#fff;border-collapse:collapse"><tr><td>${content}</td></tr><tr><td style="padding:16px 28px;font-size:11px;color:#777;border-top:1px solid #ddd">${footer}<br><a href="${escapeHtml(url)}">Open details</a></td></tr></table></td></tr></table></body></html>`;
  const text = [`Hello ${member.name},`, ...paragraphs, `${s.ctaLabel ?? "View details"}: ${url}`, ...footerLines].join("\n\n");
  return { from: `${s.fromName} <${s.fromLocalPart ?? "alerts"}@${s.fromDomain ?? "notice.test"}>`, to: member.email, subject: s.subject, text, html };
}
