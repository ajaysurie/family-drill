import type { BrandId } from "./types";

// Email artwork is static: brand logos live in public/brand/logos and heroes render at build time.
// Every recipient loads the same URL with no query string, so an image load can never identify who opened a message.
export const HERO_SIZE = { width: 600, height: 225 } as const;
export const FAMILY_DRILL_LOGO = { path: "/email-assets/logo/family-drill.png", width: 310, height: 36 } as const;

export const logoPath = (id: BrandId) => `/brand/logos/${id}.png`;
export const heroPath = (scenarioId: string) => `/email-assets/hero/${scenarioId}.png`;

export const appBaseUrl = () => (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
