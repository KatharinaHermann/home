import { alpha, contrast, darken, hexToHsl, inkFor, lighten, lightest, darkest, mix, mostSaturated, saturate } from "./color";
import type { Mood, Palette } from "./moods";

/** Everything the UI needs to re-skin itself from one palette + mood. */
export type Theme = {
  bg: string;
  bgDeep: string;
  ink: string;
  inkMuted: string;
  accent: string;
  accentInk: string;
  secondary: string;
  glass: string;
  glassStrong: string;
  glassBorder: string;
  glassHighlight: string;
  blobs: string[];
  dark: boolean;
  radius: number;
  font: Mood["font"];
  energy: number;
};

export function deriveTheme(palette: Palette, mood: Mood): Theme {
  const dark = !!palette.dark;
  const base = dark ? darkest(palette.colors) : lightest(palette.colors);
  const bg = dark ? mix(base, "#0b0b0d", 0.35) : mix(base, "#ffffff", 0.55);
  const bgDeep = dark ? mix(base, "#000000", 0.55) : mix(base, "#ffffff", 0.2);
  const ink = dark ? mix(lightest(palette.colors), "#ffffff", 0.6) : mix(darkest(palette.colors), "#000000", 0.5);
  let accent = mostSaturated(palette.colors);
  // guarantee the accent is legible on the background
  let guard = 0;
  while (contrast(accent, bg) < 2.6 && guard++ < 8) accent = dark ? lighten(saturate(accent, 0.05), 0.08) : darken(accent, 0.08);
  const secondary = palette.colors[1];
  const ah = hexToHsl(accent);
  return {
    bg, bgDeep, ink,
    inkMuted: alpha(ink, 0.62),
    accent,
    accentInk: inkFor(accent),
    secondary,
    glass: dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.42)",
    glassStrong: dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.68)",
    glassBorder: dark ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.75)",
    glassHighlight: dark ? `hsla(${ah.h},80%,85%,0.35)` : "rgba(255,255,255,0.95)",
    blobs: palette.colors.map((c) => (dark ? saturate(c, 0.1) : mix(saturate(c, 0.15), "#ffffff", 0.1))),
    dark,
    radius: mood.radius,
    font: mood.font,
    energy: mood.energy,
  };
}

/** Apply a theme as CSS custom properties on <html>. */
export function applyTheme(t: Theme, el: HTMLElement = document.documentElement) {
  const s = el.style;
  s.setProperty("--bg", t.bg);
  s.setProperty("--bg-deep", t.bgDeep);
  s.setProperty("--ink", t.ink);
  s.setProperty("--ink-muted", t.inkMuted);
  s.setProperty("--accent", t.accent);
  s.setProperty("--accent-ink", t.accentInk);
  s.setProperty("--secondary", t.secondary);
  s.setProperty("--glass", t.glass);
  s.setProperty("--glass-strong", t.glassStrong);
  s.setProperty("--glass-border", t.glassBorder);
  s.setProperty("--glass-highlight", t.glassHighlight);
  t.blobs.forEach((b, i) => s.setProperty(`--blob-${i + 1}`, b));
  s.setProperty("--radius", `${t.radius}px`);
  s.setProperty("--energy", `${t.energy}`);
  s.setProperty("--font-display", t.font === "serif" ? "var(--font-fraunces)" : t.font === "mono" ? "var(--font-geist-mono)" : "var(--font-geist-sans)");
  el.dataset.theme = t.dark ? "dark" : "light";
  el.style.colorScheme = t.dark ? "dark" : "light";
}
