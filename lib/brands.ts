import type { BrandId } from "./types";

export const brands: Record<BrandId, { name: string; primary: string; accent: string; mark: string }> = {
  swiftbox: { name: "SwiftBox", primary: "#087f78", accent: "#f1dfbd", mark: "box" },
  riverline: { name: "Riverline Bank", primary: "#154c3b", accent: "#d4a93a", mark: "river" },
  streamly: { name: "Streamly", primary: "#59245f", accent: "#c7ef62", mark: "play" },
  softshield: { name: "SoftShield", primary: "#344454", accent: "#f1ad3d", mark: "shield" },
  "maple-district": { name: "Maple District Portal", primary: "#7b2639", accent: "#fff3d4", mark: "leaf" },
  paynest: { name: "PayNest", primary: "#4637a8", accent: "#baf2d8", mark: "nest" },
};

export function brandMark(id: BrandId) {
  const b = brands[id];
  const shape = id === "swiftbox" ? '<path d="M7 8l9-4 9 4-9 5zM7 8v10l9 5V13m9-5v10l-9 5"/>' : id === "riverline" ? '<path d="M5 18c5-7 9 5 18-7M5 12c5-7 9 5 18-7"/>' : id === "streamly" ? '<path d="M10 6l12 8-12 8z"/>' : id === "softshield" ? '<path d="M14 4l9 4v6c0 6-4 9-9 11-5-2-9-5-9-11V8z"/>' : id === "maple-district" ? '<path d="M14 3l2 6 5-2-2 5 4 2-6 3-1 7h-4l-1-7-6-3 4-2-2-5 5 2z"/>' : '<path d="M5 17c4-7 14-7 18 0M7 20h14M9 14c1-5 9-5 10 0"/>';
  return `<span style="display:inline-flex;align-items:center;gap:10px;font-size:20px;font-weight:800;color:${b.primary}"><svg width="30" height="30" viewBox="0 0 28 28" fill="none" stroke="${b.primary}" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true">${shape}</svg>${b.name}</span>`;
}
