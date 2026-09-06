/**
 * Small, dependency-free colour toolkit used by the theme engine,
 * the palette extractor and the product matcher.
 */
export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  h = ((h % 360) + 360) % 360 / 360;
  if (s === 0) { const v = l * 255; return { r: v, g: v, b: v }; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return { r: f(h + 1 / 3) * 255, g: f(h) * 255, b: f(h - 1 / 3) * 255 };
}

export const hexToHsl = (hex: string) => rgbToHsl(hexToRgb(hex));
export const hslToHex = (hsl: HSL) => rgbToHex(hslToRgb(hsl));

export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a: string, b: string): number {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Mix `a` towards `b` by t (0..1). */
export function mix(a: string, b: string, t: number): string {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex({ r: A.r + (B.r - A.r) * t, g: A.g + (B.g - A.g) * t, b: A.b + (B.b - A.b) * t });
}

export function lighten(hex: string, amt: number) {
  const hsl = hexToHsl(hex); return hslToHex({ ...hsl, l: Math.min(1, hsl.l + amt) });
}
export function darken(hex: string, amt: number) {
  const hsl = hexToHsl(hex); return hslToHex({ ...hsl, l: Math.max(0, hsl.l - amt) });
}
export function saturate(hex: string, amt: number) {
  const hsl = hexToHsl(hex); return hslToHex({ ...hsl, s: Math.max(0, Math.min(1, hsl.s + amt)) });
}
export function alpha(hex: string, a: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
}

/** Pick black or white ink that reads on the given background. */
export function inkFor(bg: string): string {
  return contrast(bg, "#111111") >= contrast(bg, "#ffffff") ? "#111111" : "#ffffff";
}

/** Perceptual-ish distance in HSL space, used to match products to palettes. */
export function colorDistance(a: string, b: string): number {
  const A = hexToHsl(a), B = hexToHsl(b);
  const dh = Math.min(Math.abs(A.h - B.h), 360 - Math.abs(A.h - B.h)) / 180;
  const ds = Math.abs(A.s - B.s);
  const dl = Math.abs(A.l - B.l);
  // low-saturation colours: hue matters less
  const hueWeight = Math.min(A.s, B.s) * 1.2;
  return Math.sqrt((dh * hueWeight) ** 2 + (ds * 0.8) ** 2 + (dl * 1.4) ** 2);
}

/** Most saturated colour of a set - our "accent" candidate. */
export function mostSaturated(colors: string[]): string {
  return [...colors].sort((a, b) => hexToHsl(b).s * (1 - Math.abs(hexToHsl(b).l - 0.5)) - hexToHsl(a).s * (1 - Math.abs(hexToHsl(a).l - 0.5)))[0];
}
export const lightest = (colors: string[]) => [...colors].sort((a, b) => luminance(b) - luminance(a))[0];
export const darkest = (colors: string[]) => [...colors].sort((a, b) => luminance(a) - luminance(b))[0];

/**
 * K-means palette extraction from raw pixel data (used client-side on a
 * downscaled canvas). Returns `k` hex colours ordered by cluster size.
 */
export function extractPalette(pixels: Uint8ClampedArray, k = 5, iterations = 10): string[] {
  const pts: RGB[] = [];
  for (let i = 0; i < pixels.length; i += 4 * 3) {
    if (pixels[i + 3] < 128) continue;
    pts.push({ r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] });
  }
  if (pts.length === 0) return [];
  // init: spread over luminance-sorted samples
  const sorted = [...pts].sort((a, b) => a.r + a.g + a.b - (b.r + b.g + b.b));
  let centers: RGB[] = Array.from({ length: k }, (_, i) => sorted[Math.floor(((i + 0.5) / k) * sorted.length)]);
  const dist = (a: RGB, b: RGB) => (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
  let counts: number[] = [];
  for (let it = 0; it < iterations; it++) {
    const sums = centers.map(() => ({ r: 0, g: 0, b: 0, n: 0 }));
    for (const p of pts) {
      let best = 0, bd = Infinity;
      for (let c = 0; c < centers.length; c++) { const d = dist(p, centers[c]); if (d < bd) { bd = d; best = c; } }
      sums[best].r += p.r; sums[best].g += p.g; sums[best].b += p.b; sums[best].n++;
    }
    centers = sums.map((s, i) => (s.n ? { r: s.r / s.n, g: s.g / s.n, b: s.b / s.n } : centers[i]));
    counts = sums.map((s) => s.n);
  }
  return centers
    .map((c, i) => ({ hex: rgbToHex(c), n: counts[i] }))
    .sort((a, b) => b.n - a.n)
    .map((c) => c.hex);
}
