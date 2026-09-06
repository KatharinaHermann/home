import Link from "next/link";
import { ArrowRight, Palette, LayoutGrid, Eye, Wallet, Sparkles, ShoppingBag } from "lucide-react";
import { Glass, Eyebrow } from "@/components/glass/Glass";
import { PaletteTeaser } from "@/components/language/PaletteTeaser";
import { DemoButton } from "@/components/DemoButton";

const FLOW = [
  { icon: Palette, t: "Core design language", d: "Mood board from screenshots & Pinterest. We extract a palette and a mood; the whole app re-skins to it." },
  { icon: LayoutGrid, t: "Room constructor", d: "Upload a sketch with dimensions or photos. Claude reconstructs an apartment model you can edit." },
  { icon: Eye, t: "Room tour", d: "Click through your flat like an AD spread. Try styles and palettes, swap walls, sofas, lamps." },
  { icon: Wallet, t: "Budget → product agent", d: "Tell it your budget and sources: luxury brands, IKEA, Facebook Marketplace, what you already own." },
  { icon: Sparkles, t: "Tagged, swipeable tour", d: "Every product becomes a tag. Swipe to alternatives or none, drag things around, watch the total update." },
  { icon: ShoppingBag, t: "Buy & negotiate", d: "Confirm, then the agent negotiates on Marketplace and places orders with your authorisation." },
];

export default function Landing() {
  return (
    <div className="max-w-[1300px] w-full mx-auto px-5 lg:px-8 py-6">
      <nav className="flex items-center justify-between mb-10 lg:mb-16">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>◐</span>
          <span className="display text-2xl">Atelier</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/architecture" className="btn btn-ghost btn-sm">Architecture</Link>
          <Link href="/studio" className="btn btn-accent btn-sm">Open studio <ArrowRight size={14} /></Link>
        </div>
      </nav>

      <section className="grid lg:grid-cols-[1.1fr_.9fr] gap-8 items-center mb-16 lg:mb-24">
        <div className="fade-in">
          <Eyebrow className="mb-4">Your interior designer, in liquid glass</Eyebrow>
          <h1 className="display text-5xl md:text-7xl leading-[0.98] mb-6">
            Design your apartment like someone who <span className="display-italic accent">gets paid</span> to.
          </h1>
          <p className="muted text-lg max-w-xl mb-8">
            Build a design language, model your rooms, tour them in any style, then let a budget agent find, price and buy the exact products, from Vitra to Facebook Marketplace.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/studio" className="btn btn-accent">Start designing <ArrowRight size={16} /></Link>
            <DemoButton>Tour the demo flat</DemoButton>
          </div>
        </div>
        <PaletteTeaser />
      </section>

      <section className="mb-16">
        <Eyebrow className="mb-4">The flow</Eyebrow>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FLOW.map((f, i) => (
            <Glass lift key={f.t} className="p-5 fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-full grid place-items-center" style={{ background: "color-mix(in oklab, var(--accent) 22%, transparent)", color: "var(--ink)" }}><f.icon size={18} /></span>
                <span className="mono text-xs muted">0{i + 1}</span>
              </div>
              <h3 className="display text-xl mb-1.5">{f.t}</h3>
              <p className="muted text-sm">{f.d}</p>
            </Glass>
          ))}
        </div>
      </section>

      <footer className="muted text-xs mono py-8 flex flex-wrap gap-4 justify-between">
        <span>Atelier · demo build · prices illustrative</span>
        <Link href="/architecture" className="underline">System architecture &amp; connectors →</Link>
      </footer>
    </div>
  );
}
