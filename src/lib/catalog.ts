/**
 * Seed product catalogue. In production this is replaced by the source
 * adapters in ./sources (retailer APIs, affiliate feeds, marketplace
 * connectors). Prices are illustrative EUR figures.
 */
export type Tier = "luxury" | "mid" | "budget" | "secondhand" | "existing";

export type SourceId =
  | "ikea" | "hay" | "muuto" | "vitra" | "ferm" | "gubi" | "andtradition" | "louispoulsen" | "bolia"
  | "westelm" | "zarahome" | "hmhome" | "home24" | "westwing" | "wayfair" | "amazon" | "etsy"
  | "farrowball" | "littlegreene" | "alpina" | "jotun" | "bauhaus" | "connox" | "nordicnest"
  | "fb-marketplace" | "kleinanzeigen" | "existing";

export type Product = {
  id: string;
  name: string;
  brand: string;
  source: SourceId;
  tier: Tier;
  category: string;
  price: number;
  currency: "EUR";
  /** price is per m² (walls: perimeter × height, floor: area) */
  perSqm?: boolean;
  styleTags: string[];
  /** dominant colours; empty = tinted to your palette */
  colors: string[];
  /** scene variant this product renders as */
  variant: string;
  url: string;
  condition: "new" | "used" | "owned";
  meta?: { seller?: string; distanceKm?: number; negotiable?: boolean; listedDaysAgo?: number; note?: string };
};

export const SOURCE_META: Record<SourceId, { label: string; tier: Tier; kind: "retailer" | "marketplace" | "existing" }> = {
  ikea: { label: "IKEA", tier: "budget", kind: "retailer" },
  hmhome: { label: "H&M Home", tier: "budget", kind: "retailer" },
  zarahome: { label: "Zara Home", tier: "budget", kind: "retailer" },
  alpina: { label: "Alpina", tier: "budget", kind: "retailer" },
  bauhaus: { label: "Bauhaus", tier: "budget", kind: "retailer" },
  amazon: { label: "Amazon", tier: "budget", kind: "retailer" },
  wayfair: { label: "Wayfair", tier: "budget", kind: "retailer" },
  home24: { label: "home24", tier: "mid", kind: "retailer" },
  westwing: { label: "Westwing", tier: "mid", kind: "retailer" },
  westelm: { label: "West Elm", tier: "mid", kind: "retailer" },
  ferm: { label: "ferm LIVING", tier: "mid", kind: "retailer" },
  hay: { label: "HAY", tier: "mid", kind: "retailer" },
  muuto: { label: "Muuto", tier: "mid", kind: "retailer" },
  bolia: { label: "Bolia", tier: "mid", kind: "retailer" },
  etsy: { label: "Etsy", tier: "mid", kind: "marketplace" },
  jotun: { label: "Jotun", tier: "mid", kind: "retailer" },
  littlegreene: { label: "Little Greene", tier: "luxury", kind: "retailer" },
  farrowball: { label: "Farrow & Ball", tier: "luxury", kind: "retailer" },
  vitra: { label: "Vitra", tier: "luxury", kind: "retailer" },
  gubi: { label: "GUBI", tier: "luxury", kind: "retailer" },
  andtradition: { label: "&Tradition", tier: "luxury", kind: "retailer" },
  louispoulsen: { label: "Louis Poulsen", tier: "luxury", kind: "retailer" },
  connox: { label: "Connox", tier: "luxury", kind: "retailer" },
  nordicnest: { label: "Nordic Nest", tier: "luxury", kind: "retailer" },
  "fb-marketplace": { label: "Facebook Marketplace", tier: "secondhand", kind: "marketplace" },
  kleinanzeigen: { label: "Kleinanzeigen", tier: "secondhand", kind: "marketplace" },
  existing: { label: "Already yours", tier: "existing", kind: "existing" },
};

let n = 0;
const P = (
  category: string, source: SourceId, name: string, price: number, variant: string,
  styleTags: string[], colors: string[], extra: Partial<Product> = {},
): Product => ({
  id: `p${(++n).toString().padStart(3, "0")}`,
  name, brand: SOURCE_META[source].label, source, tier: SOURCE_META[source].tier, category, price,
  currency: "EUR", styleTags, colors, variant,
  url: `https://example.com/${source}/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"))}`,
  condition: source === "fb-marketplace" || source === "kleinanzeigen" ? "used" : "new",
  ...extra,
});
const FB = (category: string, name: string, price: number, variant: string, styleTags: string[], colors: string[], meta: Product["meta"]) =>
  P(category, "fb-marketplace", name, price, variant, styleTags, colors, { meta: { negotiable: true, ...meta } });

export const CATALOG: Product[] = [
  // ── Paint (per m² wall) ─────────────────────────────────────────────
  P("paint", "alpina", "Feine Farben matt", 1.9, "flat", ["scandi", "minimal", "japandi", "coastal", "softminimal"], [], { perSqm: true }),
  P("paint", "jotun", "Lady Pure Color", 3.4, "flat", ["scandi", "japandi", "softminimal", "coastal", "midcentury"], [], { perSqm: true }),
  P("paint", "littlegreene", "Intelligent Matt Emulsion", 6.2, "halfwall", ["darkacademia", "artdeco", "glam", "maximalist", "midcentury"], [], { perSqm: true }),
  P("paint", "farrowball", "Estate Emulsion", 7.8, "flat", ["darkacademia", "glam", "artdeco", "maximalist", "softminimal"], [], { perSqm: true }),
  P("paint", "bauhaus", "Limewash Kalkfarbe", 4.6, "limewash", ["softminimal", "japandi", "boho", "natural"], [], { perSqm: true }),
  P("paint", "farrowball", "Dead Flat (Limewash look)", 9.5, "limewash", ["softminimal", "japandi", "glam"], [], { perSqm: true }),
  // ── Flooring (per m²) ───────────────────────────────────────────────
  P("flooring", "bauhaus", "Vinyl planks oak", 24, "planks", ["scandi", "minimal", "coastal", "boho"], ["#C9A57A"], { perSqm: true }),
  P("flooring", "bauhaus", "Engineered oak herringbone", 68, "herringbone", ["midcentury", "darkacademia", "glam", "artdeco", "softminimal"], ["#B4885A"], { perSqm: true }),
  P("flooring", "bauhaus", "Micro-cement concrete look", 85, "concrete", ["industrial", "minimal", "softminimal"], ["#8E8B86"], { perSqm: true }),
  P("flooring", "bauhaus", "Terrazzo tiles 60×60", 52, "tiles", ["maximalist", "coastal", "midcentury", "boho"], ["#E5DCC9"], { perSqm: true }),
  P("flooring", "existing", "Keep existing floor", 0, "planks", ["*"], [], { condition: "owned", meta: { note: "Refinish only" } }),
  // ── Sofas ───────────────────────────────────────────────────────────
  P("sofa", "ikea", "SÖDERHAMN 3-seat", 649, "modular", ["scandi", "minimal", "japandi", "coastal"], ["#D9CDBA", "#8A9AA8"]),
  P("sofa", "ikea", "KIVIK loveseat", 549, "loveseat", ["scandi", "minimal"], ["#DCDCD6", "#4A4D52"]),
  P("sofa", "ikea", "JÄTTEBO curved module", 1190, "curved", ["softminimal", "scandi", "japandi"], ["#EFE8DC", "#B7AC9C"]),
  P("sofa", "home24", "Studio Copenhagen Bouclé", 1290, "curved", ["softminimal", "scandi", "glam"], ["#F1EDE6", "#DDD6CB"]),
  P("sofa", "hay", "Mags Soft Low modular", 3990, "modular", ["scandi", "minimal", "japandi", "midcentury"], ["#8C9A7E", "#B5946B", "#2A4E6E"]),
  P("sofa", "bolia", "Sepia 3-seat", 2790, "loveseat", ["scandi", "softminimal", "midcentury"], ["#C8B79B", "#4F6B4F"]),
  P("sofa", "westelm", "Haven leather sofa", 2490, "loveseat", ["industrial", "darkacademia", "midcentury"], ["#5A2A2B", "#8C5A3C"]),
  P("sofa", "muuto", "Outline 3-seat", 4690, "loveseat", ["scandi", "minimal", "midcentury"], ["#23262A", "#8A9AA8", "#D8B15A"]),
  P("sofa", "vitra", "Soft Modular Sofa", 7900, "modular", ["minimal", "midcentury", "glam", "softminimal"], ["#4A4D52", "#E9DFCF"]),
  P("sofa", "westwing", "Velvet Chesterfield Chloé", 1890, "chesterfield", ["glam", "artdeco", "maximalist", "darkacademia"], ["#1F6F5A", "#D95B8E", "#2F49B8"]),
  FB("sofa", "Vintage teak-frame sofa, new cushions", 380, "loveseat", ["midcentury", "retro", "boho"], ["#9C6B3F", "#D8B15A"], { seller: "Jonas K.", distanceKm: 4.2, listedDaysAgo: 3 }),
  FB("sofa", "IKEA Söderhamn corner, grey, 2 yrs", 250, "modular", ["scandi", "minimal"], ["#8E8B86"], { seller: "Mira", distanceKm: 7.8, listedDaysAgo: 9 }),
  FB("sofa", "Green velvet sofa, barely used", 520, "chesterfield", ["glam", "maximalist", "artdeco"], ["#1F6F5A"], { seller: "Ali S.", distanceKm: 2.1, listedDaysAgo: 1 }),
  P("sofa", "existing", "Keep my current sofa", 0, "loveseat", ["*"], [], { condition: "owned" }),
  // ── Rugs ────────────────────────────────────────────────────────────
  P("rug", "ikea", "TIPHEDE flatwoven 155×220", 39, "striped", ["scandi", "minimal", "coastal"], ["#F4F3EF", "#23262A"]),
  P("rug", "hmhome", "Wool-blend rug 170×240", 149, "plain", ["scandi", "softminimal", "japandi"], ["#DDD6CB", "#B7AC9C"]),
  P("rug", "etsy", "Vintage Turkish kilim 160×230", 340, "kilim", ["boho", "maximalist", "eclectic", "midcentury"], ["#D9855C", "#2F7F86", "#C9A25D"]),
  P("rug", "ferm", "Kelim Fringe rug", 489, "kilim", ["scandi", "boho", "japandi"], ["#EFE8DC", "#8C9A7E"]),
  P("rug", "nordicnest", "Kvadrat wool rug 200×300", 1290, "plain", ["minimal", "japandi", "softminimal", "glam"], ["#B7AC9C", "#3A342C"]),
  FB("rug", "Large jute rug 200×290", 60, "plain", ["coastal", "boho", "natural"], ["#C8B79B"], { seller: "Petra", distanceKm: 5.5, listedDaysAgo: 12 }),
  // ── Coffee tables ───────────────────────────────────────────────────
  P("coffee-table", "ikea", "LISTERBY round oak", 149, "round", ["scandi", "japandi", "minimal"], ["#C9A57A"]),
  P("coffee-table", "ikea", "VITTSJÖ nesting glass", 79, "nesting", ["industrial", "minimal", "midcentury"], ["#23262A"]),
  P("coffee-table", "hay", "Slit Table round", 349, "round", ["scandi", "minimal", "midcentury"], ["#B99145", "#23262A"]),
  P("coffee-table", "westwing", "Travertine block table", 690, "rect", ["softminimal", "glam", "minimal"], ["#E5DCC9"]),
  P("coffee-table", "gubi", "Epic Coffee Table travertine", 2450, "round", ["softminimal", "glam", "artdeco"], ["#F1EDE6"]),
  FB("coffee-table", "Mid-century teak coffee table", 120, "rect", ["midcentury", "retro", "darkacademia"], ["#9C6B3F"], { seller: "Frank", distanceKm: 3.0, listedDaysAgo: 5 }),
  // ── Floor lamps ─────────────────────────────────────────────────────
  P("floor-lamp", "ikea", "RANARP floor lamp", 59, "column", ["industrial", "scandi", "minimal"], ["#23262A"]),
  P("floor-lamp", "ikea", "HOLMÖ paper floor lamp", 19, "paper", ["japandi", "scandi", "boho", "minimal"], ["#F4F3EF"]),
  P("floor-lamp", "hay", "Matin floor lamp", 349, "tripod", ["scandi", "softminimal", "japandi"], ["#EFE8DC"]),
  P("floor-lamp", "westwing", "Arc floor lamp marble base", 289, "arc", ["midcentury", "glam", "minimal"], ["#B99145"]),
  P("floor-lamp", "andtradition", "Flowerpot VP1 floor", 745, "column", ["midcentury", "maximalist", "scandi"], ["#D8B15A", "#1F6F5A", "#F0B7A0"]),
  P("floor-lamp", "louispoulsen", "AJ Floor", 1120, "tripod", ["midcentury", "minimal", "darkacademia"], ["#141414", "#4F6B4F"]),
  FB("floor-lamp", "Arco-style arc lamp", 140, "arc", ["midcentury", "glam"], ["#8E8B86"], { seller: "Lena", distanceKm: 9.1, listedDaysAgo: 2 }),
  // ── Art ─────────────────────────────────────────────────────────────
  P("art", "ikea", "BJÖRKSTA canvas 140×100", 69, "oversized", ["scandi", "minimal", "coastal"], ["#DCDCD6"]),
  P("art", "etsy", "Abstract giclée print set of 3", 120, "gallery", ["softminimal", "japandi", "boho", "maximalist"], ["#B7AC9C", "#D95B8E"]),
  P("art", "etsy", "Gallery wall bundle (9 frames)", 260, "gallery", ["maximalist", "eclectic", "darkacademia", "boho"], ["#3A342C", "#B99145"]),
  P("art", "westelm", "Framed oversized photograph", 590, "oversized", ["minimal", "industrial", "glam"], ["#23262A"]),
  P("art", "connox", "Vitra Wooden Doll + Print", 420, "single", ["midcentury", "scandi"], ["#D8B15A"]),
  FB("art", "Original oil painting 90×70", 200, "single", ["darkacademia", "maximalist", "eclectic"], ["#5A2A2B", "#2F4A3A"], { seller: "Atelier Nord", distanceKm: 6.3, listedDaysAgo: 20 }),
  // ── Plants ──────────────────────────────────────────────────────────
  P("plant", "ikea", "Ficus lyrata 120cm + pot", 45, "tall", ["*"], ["#2F4A3A"]),
  P("plant", "amazon", "Monstera deliciosa + basket", 39, "bushy", ["*"], ["#2F4A3A"]),
  P("plant", "etsy", "Macramé hanger + pothos", 32, "hanging", ["boho", "coastal", "scandi"], ["#8C9A7E"]),
  P("plant", "hmhome", "Olive tree 150cm", 129, "tall", ["softminimal", "coastal", "japandi"], ["#8F9564"]),
  // ── Curtains ────────────────────────────────────────────────────────
  P("curtains", "ikea", "HILJA sheer pair", 12, "sheer", ["scandi", "minimal", "coastal", "japandi"], ["#FAFAF7"]),
  P("curtains", "ikea", "DYTÅG linen pair", 99, "linen", ["japandi", "scandi", "softminimal", "coastal"], ["#EFE8DC", "#8A9AA8"]),
  P("curtains", "zarahome", "Washed linen curtain", 119, "linen", ["softminimal", "japandi", "boho"], ["#DDD6CB"]),
  P("curtains", "westwing", "Velvet blackout pair", 179, "velvet", ["glam", "artdeco", "maximalist", "darkacademia"], ["#1F6F5A", "#5A2A2B", "#2F49B8"]),
  // ── Shelving ────────────────────────────────────────────────────────
  P("shelving", "ikea", "BILLY / OXBERG", 129, "closed", ["scandi", "minimal", "darkacademia"], ["#F4F3EF", "#3A342C"]),
  P("shelving", "ikea", "IVAR pine open", 199, "open", ["scandi", "industrial", "boho"], ["#C9A57A"]),
  P("shelving", "hmhome", "Ladder shelf oak", 149, "ladder", ["scandi", "coastal", "boho"], ["#C8B79B"]),
  P("shelving", "hay", "Pier System", 1890, "open", ["minimal", "scandi", "industrial"], ["#23262A", "#F0E6D2"]),
  P("shelving", "vitra", "Bookshelf (String-style) walnut", 2200, "open", ["midcentury", "darkacademia", "minimal"], ["#5A3A28"]),
  FB("shelving", "String shelf, 3 bays, walnut", 450, "open", ["midcentury", "scandi", "minimal"], ["#5A3A28"], { seller: "Tobias", distanceKm: 11.0, listedDaysAgo: 4 }),
  // ── Kitchen ─────────────────────────────────────────────────────────
  P("cabinets", "ikea", "METOD + VEDDINGE flat fronts (per m²)", 210, "flat", ["scandi", "minimal", "japandi"], [], { perSqm: true }),
  P("cabinets", "ikea", "METOD + BODBYN shaker (per m²)", 260, "shaker", ["coastal", "darkacademia", "scandi"], [], { perSqm: true }),
  P("cabinets", "bauhaus", "Fluted oak fronts (per m²)", 420, "fluted", ["softminimal", "japandi", "artdeco", "midcentury"], [], { perSqm: true }),
  P("cabinets", "existing", "Repaint existing fronts", 18, "flat", ["*"], [], { perSqm: true, condition: "owned" }),
  P("countertop", "ikea", "SÄLJAN laminate (per m²)", 95, "stone", ["*"], ["#F4F3EF"], { perSqm: true }),
  P("countertop", "ikea", "Oak butcher block (per m²)", 190, "wood", ["scandi", "japandi", "boho", "coastal"], ["#C9A57A"], { perSqm: true }),
  P("countertop", "bauhaus", "Quartz composite (per m²)", 480, "stone", ["minimal", "glam", "softminimal", "artdeco"], ["#F1EDE6"], { perSqm: true }),
  P("countertop", "bauhaus", "Micro-cement worktop (per m²)", 390, "concrete", ["industrial", "minimal"], ["#8E8B86"], { perSqm: true }),
  P("backsplash", "bauhaus", "White subway tile (per m²)", 28, "subway", ["scandi", "coastal", "industrial", "minimal"], ["#FAFAF7"], { perSqm: true }),
  P("backsplash", "etsy", "Moroccan zellige (per m²)", 140, "zellige", ["boho", "softminimal", "maximalist", "coastal"], ["#9FC2BE", "#EFE8DC"], { perSqm: true }),
  P("backsplash", "bauhaus", "Quartz slab splashback (per m²)", 320, "slab", ["glam", "minimal", "artdeco", "softminimal"], ["#F1EDE6"], { perSqm: true }),
  P("bar-stool", "ikea", "NORRARYD stool ×2", 158, "wood", ["scandi", "midcentury", "japandi"], ["#23262A", "#C9A57A"]),
  P("bar-stool", "hay", "About A Stool AAS32 ×2", 598, "metal", ["scandi", "minimal", "industrial"], ["#8C9A7E", "#23262A", "#D8B15A"]),
  P("bar-stool", "westwing", "Bouclé counter stool ×2", 358, "upholstered", ["softminimal", "glam"], ["#F1EDE6"]),
  FB("bar-stool", "Tolix-style metal stools ×3", 90, "metal", ["industrial", "vintage"], ["#4A4D52"], { seller: "Café Ost", distanceKm: 1.7, listedDaysAgo: 6 }),
  P("pendant", "ikea", "REGNSKUR paper globe", 25, "globe", ["japandi", "scandi", "boho", "minimal"], ["#F4F3EF"]),
  P("pendant", "muuto", "Unfold pendant", 199, "cone", ["scandi", "minimal", "industrial"], ["#8A9AA8", "#B8552F", "#23262A"]),
  P("pendant", "ferm", "Ripple linear brass", 449, "linear", ["softminimal", "glam", "artdeco"], ["#B99145"]),
  P("pendant", "louispoulsen", "PH 5", 1075, "cone", ["midcentury", "scandi", "darkacademia"], ["#F0E6D2", "#4F6B4F", "#D8B15A"]),
  P("pendant", "gubi", "Multi-Lite", 1290, "globe", ["artdeco", "glam", "midcentury"], ["#B99145", "#161519"]),
  FB("pendant", "Vintage enamel factory pendant", 75, "cone", ["industrial", "vintage"], ["#2A2B2E"], { seller: "Loft 12", distanceKm: 3.9, listedDaysAgo: 8 }),
  // ── Bedroom ─────────────────────────────────────────────────────────
  P("bed", "ikea", "MALM 160 oak veneer", 299, "platform", ["scandi", "minimal", "japandi"], ["#C9A57A", "#F4F3EF"]),
  P("bed", "ikea", "TUFJORD upholstered 160", 449, "upholstered", ["softminimal", "scandi"], ["#8A9AA8", "#DDD6CB"]),
  P("bed", "hmhome", "Rattan headboard bed 160", 599, "spindle", ["boho", "coastal", "japandi"], ["#C8B79B"]),
  P("bed", "westwing", "Bouclé curved bed 180", 1290, "upholstered", ["softminimal", "glam"], ["#F1EDE6", "#B7AC9C"]),
  P("bed", "bolia", "Cloud upholstered 180", 2190, "upholstered", ["scandi", "softminimal", "midcentury"], ["#8C9A7E", "#3A342C"]),
  P("bed", "westelm", "Mid-century canopy bed walnut", 1990, "canopy", ["midcentury", "darkacademia", "glam"], ["#5A3A28"]),
  FB("bed", "Solid oak platform bed 160, incl. slats", 220, "platform", ["japandi", "scandi", "minimal"], ["#B4885A"], { seller: "Sara", distanceKm: 6.0, listedDaysAgo: 2 }),
  P("bed", "existing", "Keep my bed", 0, "platform", ["*"], [], { condition: "owned" }),
  P("nightstand", "ikea", "NORDLI ×2", 158, "drawer", ["scandi", "minimal"], ["#F4F3EF", "#23262A"]),
  P("nightstand", "ikea", "KNARREVIK ×2", 30, "pedestal", ["industrial", "minimal"], ["#23262A"]),
  P("nightstand", "hay", "Slit Table side ×2", 398, "pedestal", ["scandi", "midcentury", "minimal"], ["#B99145", "#23262A"]),
  P("nightstand", "westwing", "Floating oak shelf ×2", 138, "floating", ["japandi", "softminimal", "minimal"], ["#C9A57A"]),
  FB("nightstand", "Pair of teak bedside tables", 90, "drawer", ["midcentury", "retro"], ["#9C6B3F"], { seller: "Frank", distanceKm: 3.0, listedDaysAgo: 5 }),
  P("table-lamp", "ikea", "TOKABO glass ×2", 30, "dome", ["scandi", "minimal"], ["#F4F3EF"]),
  P("table-lamp", "hmhome", "Ceramic mushroom lamp ×2", 98, "mushroom", ["softminimal", "japandi", "boho", "midcentury"], ["#DDD6CB", "#D9855C"]),
  P("table-lamp", "andtradition", "Flowerpot VP3 ×2", 590, "mushroom", ["midcentury", "maximalist", "scandi"], ["#D8B15A", "#1F6F5A", "#F0B7A0", "#2F49B8"]),
  P("table-lamp", "gubi", "Bestlite BL1 ×2", 1100, "dome", ["artdeco", "darkacademia", "industrial", "midcentury"], ["#B99145", "#161519"]),
  P("table-lamp", "hay", "Pao portable ×2", 258, "globe", ["scandi", "minimal", "japandi"], ["#F0E6D2"]),
  P("wardrobe", "ikea", "PAX 200cm sliding", 720, "sliding", ["scandi", "minimal"], ["#F4F3EF"]),
  P("wardrobe", "ikea", "PAX + FORSAND hinged", 560, "hinged", ["scandi", "minimal", "japandi"], ["#F4F3EF", "#DDD6CB"]),
  P("wardrobe", "hmhome", "Open rail + shelf system", 249, "open", ["industrial", "minimal", "boho"], ["#23262A"]),
  P("wardrobe", "westwing", "Rattan wardrobe 180", 1490, "hinged", ["boho", "coastal", "japandi"], ["#C8B79B"]),
  P("wardrobe", "existing", "Keep my wardrobe", 0, "hinged", ["*"], [], { condition: "owned" }),
  // ── Bathroom ────────────────────────────────────────────────────────
  P("tiles", "bauhaus", "Matte white 20×20 (per m²)", 24, "flat", ["scandi", "minimal", "japandi"], ["#F4F3EF"], { perSqm: true }),
  P("tiles", "bauhaus", "Subway gloss (per m²)", 32, "subway", ["coastal", "industrial", "scandi"], ["#FAFAF7"], { perSqm: true }),
  P("tiles", "etsy", "Zellige handmade (per m²)", 150, "zellige", ["boho", "softminimal", "maximalist"], ["#9FC2BE", "#EFE8DC"], { perSqm: true }),
  P("tiles", "bauhaus", "Large-format stone slab (per m²)", 210, "slab", ["glam", "softminimal", "minimal", "artdeco"], ["#DDD6CB"], { perSqm: true }),
  P("vanity", "ikea", "GODMORGON 80 floating", 349, "floating", ["scandi", "minimal"], ["#F4F3EF"]),
  P("vanity", "ikea", "HEMNES console 80", 299, "console", ["coastal", "scandi", "darkacademia"], ["#F4F3EF", "#3A342C"]),
  P("vanity", "westwing", "Oak vanity + stone top", 990, "cabinet", ["japandi", "softminimal", "boho"], ["#C9A57A"]),
  P("vanity", "connox", "Fluted walnut vanity", 2400, "cabinet", ["artdeco", "glam", "midcentury"], ["#5A3A28"]),
  P("mirror", "ikea", "LINDBYN round 80", 59, "round", ["scandi", "minimal", "softminimal"], ["#23262A"]),
  P("mirror", "hmhome", "Arched mirror 150", 129, "arch", ["softminimal", "boho", "coastal"], ["#B99145"]),
  P("mirror", "ferm", "Studio mirror brass", 289, "rect", ["glam", "artdeco", "minimal"], ["#B99145"]),
  FB("mirror", "Antique gilt mirror 100×70", 150, "arch", ["darkacademia", "glam", "maximalist"], ["#B99145"], { seller: "Vintage Bee", distanceKm: 4.4, listedDaysAgo: 15 }),
  P("sconce", "ikea", "FRIHULT globe sconce ×2", 50, "globe", ["scandi", "minimal", "coastal"], ["#F4F3EF"]),
  P("sconce", "westwing", "Brass tube sconce ×2", 198, "tube", ["glam", "artdeco", "midcentury"], ["#B99145"]),
  P("sconce", "louispoulsen", "AJ Wall ×2", 1180, "shade", ["midcentury", "minimal", "darkacademia"], ["#141414"]),
  P("towels", "hmhome", "Waffle towel set + mat", 45, "plain", ["*"], ["#DDD6CB"]),
  P("towels", "zarahome", "Striped linen bath set", 89, "striped", ["coastal", "boho", "scandi"], ["#2A4E6E", "#F8F6F1"]),
  // ── Office ──────────────────────────────────────────────────────────
  P("desk", "ikea", "LAGKAPTEN / ADILS", 65, "trestle", ["scandi", "minimal"], ["#F4F3EF"]),
  P("desk", "ikea", "BEKANT sit/stand 160", 549, "sitstand", ["minimal", "industrial", "scandi"], ["#F4F3EF", "#23262A"]),
  P("desk", "hay", "CPH 90 desk", 890, "trestle", ["scandi", "minimal", "japandi"], ["#C9A57A"]),
  P("desk", "westelm", "Mid-century writing desk", 799, "writing", ["midcentury", "darkacademia"], ["#5A3A28"]),
  FB("desk", "Solid oak writing desk", 110, "writing", ["darkacademia", "midcentury", "japandi"], ["#B4885A"], { seller: "Karim", distanceKm: 2.6, listedDaysAgo: 7 }),
  P("desk-chair", "ikea", "FLINTAN task chair", 79, "task", ["minimal", "scandi"], ["#23262A"]),
  P("desk-chair", "hay", "AAC 22 wood chair", 349, "wood", ["scandi", "midcentury", "japandi"], ["#8C9A7E", "#C9A57A"]),
  P("desk-chair", "vitra", "Eames Plastic Armchair", 460, "wood", ["midcentury", "scandi", "minimal"], ["#F0E6D2", "#D8B15A", "#2A4E6E"]),
  P("desk-chair", "westwing", "Bouclé swivel lounge chair", 429, "lounge", ["softminimal", "glam"], ["#F1EDE6"]),
  FB("desk-chair", "Herman Miller Aeron, size B", 480, "task", ["minimal", "industrial"], ["#141414"], { seller: "Office Clear-out", distanceKm: 8.2, listedDaysAgo: 1 }),
  // ── Dining ──────────────────────────────────────────────────────────
  P("dining-table", "ikea", "LISABO oval 200", 349, "oval", ["scandi", "japandi", "minimal"], ["#C9A57A"]),
  P("dining-table", "ikea", "DOCKSTA round 103", 199, "round", ["midcentury", "minimal", "scandi"], ["#F4F3EF"]),
  P("dining-table", "hay", "CPH 30 table 200", 1290, "rect", ["scandi", "minimal"], ["#C9A57A", "#23262A"]),
  P("dining-table", "westwing", "Travertine round 120", 1190, "round", ["softminimal", "glam", "artdeco"], ["#E5DCC9"]),
  P("dining-table", "gubi", "Gubi Table 2.0 round", 3200, "round", ["artdeco", "glam", "midcentury"], ["#161519", "#B99145"]),
  FB("dining-table", "Extendable teak dining table", 260, "rect", ["midcentury", "darkacademia"], ["#9C6B3F"], { seller: "Uwe", distanceKm: 12.5, listedDaysAgo: 10 }),
  P("dining-chair", "ikea", "RÖNNINGE ×4", 476, "wood", ["scandi", "japandi", "minimal"], ["#C9A57A"]),
  P("dining-chair", "hmhome", "Rattan chair ×4", 396, "wood", ["boho", "coastal"], ["#C8B79B"]),
  P("dining-chair", "vitra", "Eames DSW ×4", 1720, "shell", ["midcentury", "scandi", "minimal"], ["#F0E6D2", "#D8B15A", "#2A4E6E"]),
  P("dining-chair", "westwing", "Velvet dining chair ×4", 636, "upholstered", ["glam", "artdeco", "maximalist"], ["#1F6F5A", "#D95B8E"]),
  FB("dining-chair", "Thonet-style bentwood ×6", 180, "wood", ["vintage", "darkacademia", "boho", "midcentury"], ["#5A3A28"], { seller: "Café Ost", distanceKm: 1.7, listedDaysAgo: 6 }),
  P("sideboard", "ikea", "BESTÅ low", 229, "low", ["scandi", "minimal"], ["#F4F3EF"]),
  P("sideboard", "westwing", "Fluted oak sideboard", 890, "fluted", ["softminimal", "japandi", "artdeco", "midcentury"], ["#C9A57A"]),
  P("sideboard", "vitra", "Eames Storage Unit", 3900, "tall", ["midcentury", "maximalist"], ["#E4572E", "#2F49B8"]),
  FB("sideboard", "Danish teak sideboard 180cm", 420, "low", ["midcentury", "retro", "darkacademia"], ["#9C6B3F"], { seller: "Retro Room", distanceKm: 5.9, listedDaysAgo: 3 }),
  // ── Hallway ─────────────────────────────────────────────────────────
  P("console", "ikea", "HEMNES console", 99, "drawer", ["scandi", "coastal", "darkacademia"], ["#F4F3EF", "#3A342C"]),
  P("console", "hmhome", "Slim metal console", 129, "slim", ["industrial", "minimal"], ["#23262A"]),
  P("console", "westwing", "Oak bench with cushion", 349, "bench", ["japandi", "scandi", "softminimal"], ["#C9A57A"]),
  P("coat-rack", "ikea", "TJUSIG wall hooks", 15, "wall", ["scandi", "minimal"], ["#F4F3EF"]),
  P("coat-rack", "hay", "Coat stand", 199, "standing", ["scandi", "minimal", "industrial"], ["#23262A", "#8C9A7E"]),
  P("coat-rack", "muuto", "Dots wooden hooks ×5", 145, "wall", ["scandi", "japandi", "midcentury"], ["#C9A57A", "#8A9AA8"]),
];

export const byCategory = (category: string) => CATALOG.filter((p) => p.category === category);
export const productById = (id: string) => CATALOG.find((p) => p.id === id);
