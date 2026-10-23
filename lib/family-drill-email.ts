import { LOGO_HEIGHT, appBaseUrl, logoPath, logoWidth } from "./email-assets";
import { escapeHtml } from "./render-drill-email";

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const GREEN = "#176b52", INK = "#17312b", MUTED = "#657069";

export type FamilyDrillEmail = { preheader: string; heading: string; illustration?: string; paragraphs: string[]; button?: { label: string; url: string }; list?: { title: string; items: [string, string][] }; footnote: string };

// Family Drill's own mail (sign-in, heads-up) shares one honest, clearly branded layout.
export function renderFamilyDrillEmail(email: FamilyDrillEmail, assetBase = appBaseUrl()) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(email.heading)}</title></head>`
    + `<body style="margin:0;padding:0;background:#f3efe3;font-family:${FONT};color:${INK}"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(email.preheader)}${"&nbsp;&zwnj;".repeat(60)}</div>`
    + `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f3efe3"><tr><td align="center" style="padding:32px 12px">`
    + `<table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:560px;background:#fbfaf5;border:1px solid #d8dcd4;border-radius:16px;font-family:${FONT}">`
    + `<tr><td style="padding:28px 36px 0"><img src="${assetBase}${logoPath("family-drill")}" width="${logoWidth("Family Drill")}" height="${LOGO_HEIGHT}" alt="Family Drill" style="display:block;border:0;font-size:20px;font-weight:800;color:${INK}"></td></tr>`
    + (email.illustration ? `<tr><td style="padding:22px 36px 0"><img src="${assetBase}/brand/hero-coaching.jpg" width="488" height="275" alt="${escapeHtml(email.illustration)}" style="display:block;width:100%;max-width:488px;height:auto;border:0;border-radius:14px"></td></tr>` : "")
    + `<tr><td style="padding:26px 36px 8px"><h1 style="margin:0 0 18px;font-size:26px;line-height:1.25;letter-spacing:-0.5px;color:${INK}">${escapeHtml(email.heading)}</h1>`
    + email.paragraphs.map((text) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${INK}">${escapeHtml(text)}</p>`).join("")
    + (email.button ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 22px"><tr><td bgcolor="${GREEN}" style="border-radius:100px"><a href="${escapeHtml(email.button.url)}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:100px">${escapeHtml(email.button.label)}</a></td></tr></table>` : "")
    + (email.list ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 18px;background:#dff3e9;border-radius:12px"><tr><td style="padding:20px 22px"><p style="margin:0 0 10px;font-size:13px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:${GREEN}">${escapeHtml(email.list.title)}</p>${email.list.items.map(([title, detail], index) => `<p style="margin:0 0 10px;font-size:15px;line-height:1.5;color:${INK}"><strong>${index + 1}. ${escapeHtml(title)}</strong> ${escapeHtml(detail)}</p>`).join("")}</td></tr></table>` : "")
    + `</td></tr><tr><td style="padding:18px 36px 28px;border-top:1px solid #d8dcd4;font-size:12px;line-height:1.6;color:${MUTED}">${escapeHtml(email.footnote)}<br>Family Drill · Safe scam practice for families · <a href="https://familydrill.com" style="color:${MUTED}">familydrill.com</a></td></tr>`
    + `</table></td></tr></table></body></html>`;
  const text = [email.heading, ...email.paragraphs, ...(email.button ? [`${email.button.label}: ${email.button.url}`] : []), ...(email.list ? [email.list.title, ...email.list.items.map(([title, detail], index) => `${index + 1}. ${title} ${detail}`)] : []), email.footnote].join("\n\n");
  return { html, text };
}

export const scamChecks: [string, string][] = [
  ["Was I expecting this?", "Surprise messages about money, parcels, or accounts deserve a second look."],
  ["Who really sent it?", "Check the email address, not just the name shown."],
  ["Is it rushing me?", "Deadlines and threats are there to stop you from thinking."],
  ["Can I check another way?", "Open the app or website yourself instead of using the link."],
];

export function headsUpEmail(memberName: string, organizer: string, appUrl = appBaseUrl()) {
  return {
    subject: `${organizer} added you to Family Drill scam practice`,
    ...renderFamilyDrillEmail({
      preheader: "Safe practice emails are coming. Here's what to expect.",
      heading: `Hi ${memberName}, practice emails are coming.`,
      illustration: "A grandmother and her grown son smile at a laptop together",
      paragraphs: [
        `${organizer} is using Family Drill to help your family get better at spotting scam emails.`,
        "Sometime in the next few weeks you may get a practice email that looks like it's from a company. Every company in these emails is made up, and the emails are safe. If you click one, you'll see a short page with tips. Nothing bad happens, and no one is in trouble.",
        `Treat it like a real scam. If something feels off, don't click, and tell ${organizer} instead. That counts as a win.`,
      ],
      list: { title: "The 4-question check", items: scamChecks },
      button: { label: "Learn the warning signs", url: `${appUrl}/learn` },
      footnote: `You're getting this because ${organizer} added your address to their household's practice list. Want to stop? Tell ${organizer}.`,
    }, appUrl),
  };
}
