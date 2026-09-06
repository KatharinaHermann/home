/**
 * Design languages ("moods") and the palettes users can pick from.
 * A mood shapes typography, radius, motion and material vocabulary;
 * a palette shapes every colour in the UI and in the room renders.
 */
export type Palette = {
  id: string;
  name: string;
  /** 5 swatches: [base/wall, secondary/surface, wood/warm, accent, ink/deep] */
  colors: [string, string, string, string, string];
  /** Whether the UI should go dark with this palette */
  dark?: boolean;
  tags: string[];
};

export type Mood = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  keywords: string[];
  materials: string[];
  /** Typography personality: which display font to use */
  font: "serif" | "sans" | "mono";
  /** Global radius scale in px */
  radius: number;
  /** Background blob motion (0 calm .. 1 lively) */
  energy: number;
  /** Default palette id */
  paletteId: string;
  /** Style tags used to score products */
  styleTags: string[];
  /** Emoji used as a quick glyph in UI */
  glyph: string;
};

export const PALETTES: Palette[] = [
  { id: "linen-oak", name: "Linen & Oak", colors: ["#EFE8DC", "#D9CDBA", "#B5946B", "#8C9A7E", "#3A342C"], tags: ["warm", "natural", "calm"] },
  { id: "nordic-fog", name: "Nordic Fog", colors: ["#F4F3EF", "#DCDCD6", "#C8B79B", "#8A9AA8", "#23262A"], tags: ["cool", "airy", "minimal"] },
  { id: "mustard-teak", name: "Mustard & Teak", colors: ["#F2E8D5", "#D8B15A", "#9C6B3F", "#4F6B4F", "#2E2320"], tags: ["retro", "warm", "bold"] },
  { id: "emerald-blush", name: "Emerald & Blush", colors: ["#F6E4E1", "#1F6F5A", "#C79A56", "#D95B8E", "#1B2A3A"], tags: ["bold", "jewel", "playful"] },
  { id: "concrete-rust", name: "Concrete & Rust", colors: ["#2A2B2E", "#4A4D52", "#8E8B86", "#B8552F", "#C9A66B"], dark: true, tags: ["moody", "raw", "urban"] },
  { id: "sea-salt", name: "Sea Salt", colors: ["#F8F6F1", "#E5DCC9", "#9FC2BE", "#2A4E6E", "#4B4741"], tags: ["fresh", "coastal", "calm"] },
  { id: "noir-gilt", name: "Noir & Gilt", colors: ["#161519", "#2B2A31", "#B99145", "#1F5A4B", "#F0E6D2"], dark: true, tags: ["glam", "dramatic", "evening"] },
  { id: "bone-stone", name: "Bone & Stone", colors: ["#F1EDE6", "#DDD6CB", "#B7AC9C", "#9AA394", "#4A4640"], tags: ["quiet", "monochrome", "soft"] },
  { id: "terracotta-teal", name: "Terracotta & Teal", colors: ["#F3E6D6", "#D9855C", "#C9A25D", "#2F7F86", "#3B2A22"], tags: ["earthy", "global", "warm"] },
  { id: "oxblood-forest", name: "Oxblood & Forest", colors: ["#2A1E1C", "#5A2A2B", "#2F4A3A", "#B0894E", "#E9DFCF"], dark: true, tags: ["academic", "moody", "rich"] },
  { id: "lilac-cloud", name: "Lilac Cloud", colors: ["#F6F1F9", "#D9CBE8", "#B8A7CF", "#F0B7A0", "#3C3346"], tags: ["soft", "dreamy", "pastel"] },
  { id: "ink-paper", name: "Ink & Paper", colors: ["#FAFAF7", "#E8E8E2", "#C0BFB6", "#E4572E", "#141414"], tags: ["graphic", "minimal", "bold"] },
  { id: "olive-cream", name: "Olive & Cream", colors: ["#F4EFE3", "#E0D8C3", "#8F9564", "#C97B4B", "#37381F"], tags: ["natural", "mediterranean"] },
  { id: "cobalt-sand", name: "Cobalt & Sand", colors: ["#F5EFE4", "#E2CFA8", "#2F49B8", "#F2C14E", "#20232A"], tags: ["bold", "sunny", "graphic"] },
];

export const MOODS: Mood[] = [
  {
    id: "japandi", name: "Japandi", glyph: "◯",
    tagline: "Wabi-sabi meets Scandinavian calm.",
    description: "Low silhouettes, honest wood, linen and paper. Nothing shouts; everything is placed.",
    keywords: ["quiet", "low", "handmade", "tonal", "uncluttered"],
    materials: ["white oak", "washed linen", "paper", "stoneware", "black steel"],
    font: "serif", radius: 22, energy: 0.25, paletteId: "linen-oak",
    styleTags: ["japandi", "minimal", "natural", "scandi"],
  },
  {
    id: "scandi", name: "Scandinavian", glyph: "△",
    tagline: "Light, functional, hygge.",
    description: "White walls, pale wood, soft textiles and playful black accents. Bright even in winter.",
    keywords: ["bright", "functional", "cosy", "pale wood", "hygge"],
    materials: ["birch", "wool", "matte white", "ash", "felt"],
    font: "sans", radius: 18, energy: 0.35, paletteId: "nordic-fog",
    styleTags: ["scandi", "minimal", "natural", "japandi"],
  },
  {
    id: "midcentury", name: "Mid-Century", glyph: "◐",
    tagline: "Teak, tapered legs and a hint of 1962.",
    description: "Sculptural furniture on slim legs, walnut and teak, mustard and olive with graphic prints.",
    keywords: ["retro", "sculptural", "tapered", "graphic", "warm"],
    materials: ["teak", "walnut", "bouclé", "brass", "glass"],
    font: "serif", radius: 26, energy: 0.5, paletteId: "mustard-teak",
    styleTags: ["midcentury", "retro", "warm"],
  },
  {
    id: "maximalist", name: "Maximalist", glyph: "✦",
    tagline: "More is more, but curated.",
    description: "Jewel tones, layered pattern, gallery walls and velvet. Confident colour on every surface.",
    keywords: ["layered", "pattern", "jewel", "eclectic", "gallery wall"],
    materials: ["velvet", "lacquer", "brass", "marble", "wallpaper"],
    font: "serif", radius: 30, energy: 0.9, paletteId: "emerald-blush",
    styleTags: ["maximalist", "eclectic", "glam", "boho"],
  },
  {
    id: "industrial", name: "Industrial Loft", glyph: "▣",
    tagline: "Raw materials, honest joints.",
    description: "Exposed brick, black steel, concrete and leather. Vintage factory lighting on dimmers.",
    keywords: ["raw", "exposed", "steel", "concrete", "vintage"],
    materials: ["black steel", "concrete", "reclaimed wood", "leather", "brick"],
    font: "mono", radius: 8, energy: 0.4, paletteId: "concrete-rust",
    styleTags: ["industrial", "vintage", "urban", "minimal"],
  },
  {
    id: "coastal", name: "Coastal", glyph: "≈",
    tagline: "Sun-bleached and breezy.",
    description: "Whites, sand and seafoam, rattan and rope, washed timber and lots of daylight.",
    keywords: ["breezy", "light", "rattan", "washed", "relaxed"],
    materials: ["rattan", "washed oak", "cotton", "jute", "ceramic"],
    font: "sans", radius: 24, energy: 0.45, paletteId: "sea-salt",
    styleTags: ["coastal", "natural", "boho", "scandi"],
  },
  {
    id: "artdeco", name: "Art Deco Glam", glyph: "◈",
    tagline: "Geometry, gilt and a little drama.",
    description: "Black and brass, fluted panels, fan motifs and emerald velvet. Cocktail hour, always.",
    keywords: ["glam", "geometric", "fluted", "brass", "evening"],
    materials: ["brass", "velvet", "marble", "fluted wood", "smoked glass"],
    font: "serif", radius: 14, energy: 0.6, paletteId: "noir-gilt",
    styleTags: ["glam", "artdeco", "maximalist", "eclectic"],
  },
  {
    id: "softminimal", name: "Soft Minimal", glyph: "◌",
    tagline: "Curves, plaster and quiet luxury.",
    description: "Tonal creams, limewash walls, curved sofas and travertine. Texture instead of colour.",
    keywords: ["tonal", "curved", "limewash", "quiet", "texture"],
    materials: ["limewash", "travertine", "bouclé", "oak", "linen"],
    font: "sans", radius: 32, energy: 0.2, paletteId: "bone-stone",
    styleTags: ["minimal", "softminimal", "japandi", "natural"],
  },
  {
    id: "boho", name: "Bohemian", glyph: "❋",
    tagline: "Collected, global, sun-warmed.",
    description: "Terracotta, kilims, rattan and plants everywhere. Layers that feel travelled, not bought.",
    keywords: ["collected", "global", "plants", "textile", "warm"],
    materials: ["rattan", "terracotta", "kilim", "macramé", "mango wood"],
    font: "serif", radius: 28, energy: 0.7, paletteId: "terracotta-teal",
    styleTags: ["boho", "eclectic", "natural", "maximalist"],
  },
  {
    id: "darkacademia", name: "Dark Academia", glyph: "❦",
    tagline: "Libraries, leather, low lamplight.",
    description: "Walnut shelves, oxblood leather, forest green walls and brass reading lamps.",
    keywords: ["library", "moody", "leather", "brass", "books"],
    materials: ["walnut", "leather", "brass", "wool", "dark stain"],
    font: "serif", radius: 12, energy: 0.3, paletteId: "oxblood-forest",
    styleTags: ["darkacademia", "vintage", "glam", "eclectic"],
  },
];

export const moodById = (id: string) => MOODS.find((m) => m.id === id) ?? MOODS[0];
export const paletteById = (id: string, custom: Palette[] = []) =>
  [...custom, ...PALETTES].find((p) => p.id === id) ?? PALETTES[0];
