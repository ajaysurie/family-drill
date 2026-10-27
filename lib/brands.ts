import type { BrandId } from "./types";

export type Brand = { name: string; legalName: string; primary: string; accent: string; ink: string; logo: { width: number; height: number } };

// Every brand here is invented for practice. Colors and logos are original; never swap in real trade dress.
// `logo` is the email display size of public/brand/logos/<id>.png; stacked logos display taller so the small line stays legible.
export const brands: Record<BrandId, Brand> = {
  swiftbox: { name: "SwiftBox", legalName: "SwiftBox Parcel Logistics Ltd.", primary: "#087f78", accent: "#f1dfbd", ink: "#0b3b38", logo: { width: 154, height: 36 } },
  riverline: { name: "Riverline Bank", legalName: "Riverline Savings & Trust", primary: "#154c3b", accent: "#d4a93a", ink: "#0f2c23", logo: { width: 187, height: 46 } },
  streamly: { name: "Streamly", legalName: "Streamly Media Group", primary: "#59245f", accent: "#c7ef62", ink: "#2b0f2e", logo: { width: 144, height: 36 } },
  softshield: { name: "SoftShield", legalName: "SoftShield Home Security Inc.", primary: "#344454", accent: "#f1ad3d", ink: "#1b242d", logo: { width: 148, height: 36 } },
  "maple-district": { name: "Maple District Portal", legalName: "Maple Unified School District", primary: "#7b2639", accent: "#fff3d4", ink: "#3d121c", logo: { width: 211, height: 46 } },
  paynest: { name: "PayNest", legalName: "PayNest Payments Co.", primary: "#4637a8", accent: "#baf2d8", ink: "#1e1752", logo: { width: 141, height: 36 } },
  crestway: { name: "Crestway Tolls", legalName: "Crestway Regional Toll Authority", primary: "#b4461f", accent: "#ffe1a8", ink: "#4a1c0c", logo: { width: 165, height: 50 } },
  cloudnook: { name: "Cloudnook Photos", legalName: "Cloudnook Storage Services", primary: "#1f6fd1", accent: "#d9ecff", ink: "#0c2c55", logo: { width: 246, height: 32 } },
  sharefold: { name: "Sharefold", legalName: "Sharefold Document Cloud", primary: "#0f766e", accent: "#ccfbf1", ink: "#083a36", logo: { width: 138, height: 36 } },
};

