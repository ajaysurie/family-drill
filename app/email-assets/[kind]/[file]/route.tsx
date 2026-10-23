import { ImageResponse } from "next/og";
import { brands, type Brand } from "../../../../lib/brands";
import { HERO_SIZE, LOGO_HEIGHT, logoWidth } from "../../../../lib/email-assets";
import { googleFonts } from "../../../../lib/og-fonts";
import scenarios from "../../../../lib/scenarios.json";
import type { BrandId, Scenario } from "../../../../lib/types";

export const dynamic = "force-static";
export const dynamicParams = false;

const headers = { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" };
const FAMILY_DRILL = { name: "Family Drill", primary: "#176b52", ink: "#17312b" };

export function generateStaticParams() {
  return [
    ...[...Object.keys(brands), "family-drill"].map((id) => ({ kind: "logo", file: `${id}.png` })),
    ...scenarios.map((scenario) => ({ kind: "hero", file: `${scenario.id}.png` })),
  ];
}

const Mark = ({ path, color, size }: { path: string; color: string; size: number }) => <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round"><path d={path} /></svg>;

const HouseMark = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#dff3e9" /><path d="M13 31 32 15l19 16v21H13Z" fill="#fbfaf5" stroke="#17312b" strokeWidth="4" strokeLinejoin="round" /><path d="M25 52V37h14v15" fill="#dff3e9" stroke="#17312b" strokeWidth="4" strokeLinejoin="round" /><path d="M23 29c2-5 7-5 9 0 2-5 7-5 9 0 0 5-9 10-9 10s-9-5-9-10Z" fill="#176b52" /></svg>;

// One illustration per lure, drawn on a 120x120 grid in the brand's colors.
function Illustration({ scenarioId, fg, bg, accent }: { scenarioId: string; fg: string; bg: string; accent: string }) {
  const art: Record<string, React.ReactNode> = {
    "parcel-redelivery": <g><path d="M60 18l38 18v46L60 102 22 82V36z" fill={bg} stroke={fg} strokeWidth="5" strokeLinejoin="round" /><path d="M22 36l38 18 38-18M60 54v48" fill="none" stroke={fg} strokeWidth="5" strokeLinejoin="round" /><path d="M41 27l38 18v14" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" /><circle cx="96" cy="96" r="17" fill={accent} /><path d="M96 87v11M96 104v1" stroke={fg} strokeWidth="5" strokeLinecap="round" /></g>,
    "parcel-fee": <g><path d="M60 18l38 18v46L60 102 22 82V36z" fill={bg} stroke={fg} strokeWidth="5" strokeLinejoin="round" /><path d="M22 36l38 18 38-18M60 54v48" fill="none" stroke={fg} strokeWidth="5" strokeLinejoin="round" /><circle cx="94" cy="94" r="20" fill={accent} /><path d="M100 86c-3-3-12-3-12 2 0 6 13 3 13 9 0 5-9 5-13 2M94 80v4M94 104v4" fill="none" stroke={fg} strokeWidth="4" strokeLinecap="round" /></g>,
    "payment-failed": <g><path d="M60 12l40 16v28c0 28-18 44-40 54-22-10-40-26-40-54V28z" fill={bg} stroke={fg} strokeWidth="5" strokeLinejoin="round" /><path d="M60 38v30" stroke={accent} strokeWidth="9" strokeLinecap="round" /><circle cx="60" cy="84" r="5.5" fill={accent} /></g>,
    "account-security": <g><rect x="32" y="10" width="56" height="100" rx="10" fill={bg} stroke={fg} strokeWidth="5" /><rect x="44" y="54" width="32" height="26" rx="5" fill={accent} /><path d="M50 54v-8a10 10 0 0 1 20 0v8" fill="none" stroke={accent} strokeWidth="5" /><circle cx="60" cy="98" r="4" fill={fg} /></g>,
    "stream-renewal": <g><rect x="12" y="22" width="96" height="64" rx="8" fill={bg} stroke={fg} strokeWidth="5" /><path d="M52 40l22 14-22 14z" fill={accent} /><path d="M40 100h40" stroke={fg} strokeWidth="5" strokeLinecap="round" /><circle cx="98" cy="28" r="15" fill={accent} /><path d="M92 22l12 12M104 22L92 34" stroke={fg} strokeWidth="4" strokeLinecap="round" /></g>,
    "virus-warning": <g><rect x="18" y="22" width="84" height="56" rx="6" fill={bg} stroke={fg} strokeWidth="5" /><path d="M8 92h104l-8 8H16z" fill={fg} /><path d="M60 34l20 34H40z" fill={accent} stroke={accent} strokeWidth="4" strokeLinejoin="round" /><path d="M60 46v10M60 61v1" stroke={fg} strokeWidth="5" strokeLinecap="round" /></g>,
    "school-permission": <g><rect x="26" y="16" width="68" height="92" rx="8" fill={bg} stroke={fg} strokeWidth="5" /><rect x="44" y="8" width="32" height="16" rx="5" fill={accent} stroke={fg} strokeWidth="4" /><path d="M40 48l6 6 10-12M40 76l6 6 10-12" fill="none" stroke={fg} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><path d="M64 50h18M64 78h12" stroke={fg} strokeWidth="5" strokeLinecap="round" /><circle cx="90" cy="96" r="16" fill={accent} /><path d="M90 88v10M90 103v1" stroke={fg} strokeWidth="5" strokeLinecap="round" /></g>,
    "payment-receipt": <g><path d="M28 10h64v100l-8-6-8 6-8-6-8 6-8-6-8 6-8-6-8 6z" fill={bg} stroke={fg} strokeWidth="5" strokeLinejoin="round" /><path d="M40 32h40M40 48h28M40 64h34" stroke={fg} strokeWidth="5" strokeLinecap="round" /><path d="M40 84h40" stroke={accent} strokeWidth="7" strokeLinecap="round" /></g>,
    "toll-unpaid": <g><path d="M46 112L56 30h8l10 82z" fill={bg} stroke={fg} strokeWidth="5" strokeLinejoin="round" /><path d="M60 46v10M60 70v12M60 96v10" stroke={accent} strokeWidth="5" strokeLinecap="round" /><rect x="10" y="24" width="10" height="70" rx="3" fill={fg} /><path d="M20 34h52" stroke={accent} strokeWidth="9" strokeLinecap="round" /><path d="M30 34h8M50 34h8" stroke={fg} strokeWidth="9" /></g>,
    "photos-storage": <g><path d="M30 70h62a20 20 0 0 0 0-40 28 28 0 0 0-52-4 22 22 0 0 0-10 44z" fill={bg} stroke={fg} strokeWidth="5" strokeLinejoin="round" /><rect x="40" y="60" width="44" height="40" rx="5" fill={accent} stroke={fg} strokeWidth="4" /><path d="M44 94l12-14 9 9 6-6 9 11z" fill={fg} /><circle cx="74" cy="72" r="4" fill={fg} /></g>,
    "shared-document": <g><path d="M28 8h44l22 22v82H28z" fill={bg} stroke={fg} strokeWidth="5" strokeLinejoin="round" /><path d="M72 8v22h22" fill="none" stroke={fg} strokeWidth="5" strokeLinejoin="round" /><path d="M40 52h40M40 66h40M40 80h24" stroke={fg} strokeWidth="5" strokeLinecap="round" /><circle cx="92" cy="94" r="18" fill={accent} /><path d="M84 94h16M94 88l6 6-6 6" fill="none" stroke={fg} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></g>,
  };
  return <svg width="300" height="300" viewBox="0 0 120 120">{art[scenarioId]}</svg>;
}

function Hero({ scenario, brand }: { scenario: Scenario; brand: Brand }) {
  const dark = scenario.layoutId === "security-banner" || scenario.layoutId === "cta-hero";
  const background = scenario.layoutId === "security-banner" ? brand.ink : scenario.layoutId === "cta-hero" ? brand.primary : brand.accent;
  const text = dark ? "#ffffff" : brand.ink;
  return <div style={{ display: "flex", width: "100%", height: "100%", background, alignItems: "center", justifyContent: "space-between", padding: "0 80px", fontFamily: "Inter" }}>
    <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
      <div style={{ display: "flex", fontSize: 26, fontWeight: 800, letterSpacing: 4, color: dark ? brand.accent : brand.primary }}>{brand.name.toUpperCase()}</div>
      <div style={{ display: "flex", marginTop: 18, fontSize: 70, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, color: text }}>{scenario.heroTitle}</div>
      <div style={{ display: "flex", marginTop: 20, fontSize: 32, fontWeight: 600, color: text, opacity: 0.82 }}>{scenario.heroCaption}</div>
    </div>
    <div style={{ display: "flex", width: 340, height: 340, borderRadius: 170, alignItems: "center", justifyContent: "center", background: dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.6)" }}>
      <Illustration scenarioId={scenario.id} fg={dark ? "#ffffff" : brand.ink} bg={dark ? brand.primary : "#ffffff"} accent={dark ? brand.accent : brand.primary} />
    </div>
  </div>;
}

export async function GET(_request: Request, { params }: { params: Promise<{ kind: string; file: string }> }) {
  const { kind, file } = await params;
  const id = file.replace(/\.png$/, "");
  if (kind === "logo") {
    const brand = id === "family-drill" ? FAMILY_DRILL : brands[id as BrandId];
    if (!brand) return new Response("Not found", { status: 404 });
    const scale = 2, height = LOGO_HEIGHT * scale;
    return new ImageResponse(<div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%", fontFamily: id === "family-drill" ? "Manrope" : "Inter" }}>
      {id === "family-drill" ? <HouseMark size={height} /> : <Mark path={(brand as Brand).markPath} color={brand.primary} size={height} />}
      <div style={{ display: "flex", marginLeft: 16, fontSize: 40, fontWeight: 800, letterSpacing: -1, color: id === "family-drill" ? FAMILY_DRILL.ink : brand.primary }}>{brand.name}</div>
    </div>, { width: logoWidth(brand.name) * scale, height, headers, fonts: await googleFonts(id === "family-drill" ? "Manrope" : "Inter", [800]) });
  }
  const scenario = (scenarios as Scenario[]).find((item) => item.id === id);
  if (kind !== "hero" || !scenario) return new Response("Not found", { status: 404 });
  return new ImageResponse(<Hero scenario={scenario} brand={brands[scenario.brandId]} />, { width: HERO_SIZE.width * 2, height: HERO_SIZE.height * 2, headers, fonts: await googleFonts("Inter", [600, 800]) });
}
