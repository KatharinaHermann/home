import { Eyebrow } from "@/components/glass/Glass";

export function PageHeader({ step, title, blurb, children }: { step: string; title: React.ReactNode; blurb: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 fade-in">
      <div>
        <Eyebrow className="mb-2">{step}</Eyebrow>
        <h1 className="display text-3xl md:text-4xl leading-[1.05]">{title}</h1>
        <p className="muted mt-2 max-w-xl text-sm md:text-[15px]">{blurb}</p>
      </div>
      {children && <div className="flex gap-2 flex-wrap">{children}</div>}
    </header>
  );
}
