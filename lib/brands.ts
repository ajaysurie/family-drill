import type { BrandId } from "./types";

export type Brand = { name: string; legalName: string; primary: string; accent: string; ink: string; markPath: string };

// Every brand here is invented for practice. Colors and marks are original; never swap in real trade dress.
export const brands: Record<BrandId, Brand> = {
  swiftbox: { name: "SwiftBox", legalName: "SwiftBox Parcel Logistics Ltd.", primary: "#087f78", accent: "#f1dfbd", ink: "#0b3b38", markPath: "M7 8l9-4 9 4-9 5zM7 8v10l9 5V13m9-5v10l-9 5" },
  riverline: { name: "Riverline Bank", legalName: "Riverline Savings & Trust", primary: "#154c3b", accent: "#d4a93a", ink: "#0f2c23", markPath: "M5 18c5-7 9 5 18-7M5 12c5-7 9 5 18-7" },
  streamly: { name: "Streamly", legalName: "Streamly Media Group", primary: "#59245f", accent: "#c7ef62", ink: "#2b0f2e", markPath: "M10 6l12 8-12 8z" },
  softshield: { name: "SoftShield", legalName: "SoftShield Home Security Inc.", primary: "#344454", accent: "#f1ad3d", ink: "#1b242d", markPath: "M14 4l9 4v6c0 6-4 9-9 11-5-2-9-5-9-11V8z" },
  "maple-district": { name: "Maple District Portal", legalName: "Maple Unified School District", primary: "#7b2639", accent: "#fff3d4", ink: "#3d121c", markPath: "M14 3l2 6 5-2-2 5 4 2-6 3-1 7h-4l-1-7-6-3 4-2-2-5 5 2z" },
  paynest: { name: "PayNest", legalName: "PayNest Payments Co.", primary: "#4637a8", accent: "#baf2d8", ink: "#1e1752", markPath: "M5 17c4-7 14-7 18 0M7 20h14M9 14c1-5 9-5 10 0" },
  crestway: { name: "Crestway Tolls", legalName: "Crestway Regional Toll Authority", primary: "#b4461f", accent: "#ffe1a8", ink: "#4a1c0c", markPath: "M4 23L12 5h4l8 18M14 9v3m0 4v3" },
  cloudnook: { name: "Cloudnook Photos", legalName: "Cloudnook Storage Services", primary: "#1f6fd1", accent: "#d9ecff", ink: "#0c2c55", markPath: "M8 20h13a5 5 0 0 0 0-10 7 7 0 0 0-13-1 5 5 0 0 0 0 11z" },
  sharefold: { name: "Sharefold", legalName: "Sharefold Document Cloud", primary: "#0f766e", accent: "#ccfbf1", ink: "#083a36", markPath: "M8 4h9l5 5v15H8zM17 4v5h5M11 14h8M11 18h8" },
};

export function brandMark(id: BrandId) {
  const b = brands[id];
  return `<span style="display:inline-flex;align-items:center;gap:10px;font-size:20px;font-weight:800;color:${b.primary}"><svg width="30" height="30" viewBox="0 0 28 28" fill="none" stroke="${b.primary}" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="${b.markPath}"/></svg>${b.name}</span>`;
}
