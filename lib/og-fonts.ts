type Weight = 500 | 600 | 800;

// Fetched at build time for statically rendered images; falls back to the default font offline.
async function googleFont(family: string, weight: Weight) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    return url ? { name: family, data: await (await fetch(url)).arrayBuffer(), weight, style: "normal" as const } : undefined;
  } catch {
    return undefined;
  }
}

export async function googleFonts(family: string, weights: Weight[]) {
  return (await Promise.all(weights.map((weight) => googleFont(family, weight)))).filter((font) => font !== undefined);
}
