// Email artwork is served as static PNGs rendered at build time. Every recipient loads the same
// URL with no query string, so an image load can never identify who opened a message.
export const LOGO_HEIGHT = 36;
export const HERO_SIZE = { width: 600, height: 225 } as const;

export const logoPath = (id: string) => `/email-assets/logo/${id}.png`;
export const heroPath = (scenarioId: string) => `/email-assets/hero/${scenarioId}.png`;
export const logoWidth = (name: string) => Math.round(LOGO_HEIGHT * (1.4 + name.length * 0.6));

export const appBaseUrl = () => (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
