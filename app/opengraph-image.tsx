import { ImageResponse } from "next/og";
import { googleFonts } from "../lib/og-fonts";

export const alt = "Family Drill: practice the scam before the real one hits";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: 72, background: "#fbfaf5", fontFamily: "Manrope", color: "#17312b" }}>
    <div style={{ display: "flex", alignItems: "center", fontSize: 38, fontWeight: 800 }}>
      <svg width="72" height="72" viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#dff3e9" /><path d="M13 31 32 15l19 16v21H13Z" fill="#fbfaf5" stroke="#17312b" strokeWidth="4" strokeLinejoin="round" /><path d="M25 52V37h14v15" fill="#dff3e9" stroke="#17312b" strokeWidth="4" strokeLinejoin="round" /><path d="M23 29c2-5 7-5 9 0 2-5 7-5 9 0 0 5-9 10-9 10s-9-5-9-10Z" fill="#176b52" /></svg>
      <span style={{ marginLeft: 20 }}>Family Drill</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -3, maxWidth: 1000 }}>Practice the scam before the real one hits.</div>
      <div style={{ display: "flex", marginTop: 28, fontSize: 32, fontWeight: 500, color: "#657069" }}>Safe, surprise practice emails for your family, sent by your AI assistant.</div>
    </div>
    <div style={{ display: "flex", fontSize: 26, color: "#176b52", fontWeight: 800 }}>Works with Grok Bot · Meta Muse · any MCP assistant</div>
  </div>, { ...size, fonts: await googleFonts("Manrope", [500, 800]) });
}
