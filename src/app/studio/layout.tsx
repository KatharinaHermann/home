import { Stepper } from "@/components/studio/Stepper";
import { PricePill } from "@/components/studio/PricePill";
import { ConnectorCatcher } from "@/components/studio/ConnectorCatcher";
import { Suspense } from "react";

export default function StudioLayout({ children }: LayoutProps<"/studio">) {
  return (
    <div className="max-w-[1500px] w-full mx-auto px-3 sm:px-5 lg:px-8 py-4 lg:py-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
      <aside className="lg:w-64 shrink-0 lg:sticky lg:top-6 lg:self-start"><Stepper /></aside>
      <main className="flex-1 min-w-0 pb-24">{children}</main>
      <PricePill />
      <Suspense><ConnectorCatcher /></Suspense>
    </div>
  );
}
