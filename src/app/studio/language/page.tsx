import { PageHeader } from "@/components/studio/PageHeader";
import { MoodGrid } from "@/components/language/MoodGrid";
import { PaletteGrid } from "@/components/language/PaletteGrid";
import { MoodBoard } from "@/components/language/MoodBoard";
import { IdentityCard } from "@/components/language/IdentityCard";
import { Eyebrow } from "@/components/glass/Glass";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LanguagePage() {
  return (
    <div>
      <PageHeader step="Step 1 · Design language" title={<>Collect, extract, <span className="display-italic accent">decide.</span></>} blurb="Everything you add here becomes the identity of your home. Watch the app itself change as you choose: colours, corners, typography and motion follow your language.">
        <Link href="/studio/rooms" className="btn btn-accent btn-sm">Next: rooms <ArrowRight size={14} /></Link>
      </PageHeader>
      <div className="grid lg:grid-cols-[1fr_340px] gap-5">
        <div className="space-y-8 min-w-0">
          <section><Eyebrow className="mb-3">Mood board</Eyebrow><MoodBoard /></section>
          <section><Eyebrow className="mb-3">Mood · pick the language</Eyebrow><MoodGrid /></section>
          <section><Eyebrow className="mb-3">Colour palette</Eyebrow><PaletteGrid /></section>
        </div>
        <IdentityCard />
      </div>
    </div>
  );
}
