"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Palette, LayoutGrid, Eye, Wallet, Sparkles, ShoppingBag, Check, Home } from "lucide-react";
import { Glass } from "@/components/glass/Glass";
import { useShallow } from "zustand/react/shallow";
import { stepStatus, useStudio } from "@/lib/store";

export const STEPS = [
  { id: "language", label: "Design language", href: "/studio/language", icon: Palette, hint: "Mood board & palette" },
  { id: "rooms", label: "Rooms", href: "/studio/rooms", icon: LayoutGrid, hint: "Sketch → model" },
  { id: "tour", label: "Room tour", href: "/studio/tour", icon: Eye, hint: "Try styles, swap elements" },
  { id: "budget", label: "Budget agent", href: "/studio/budget", icon: Wallet, hint: "Sources & optimisation" },
  { id: "products", label: "Products", href: "/studio/products", icon: Sparkles, hint: "Swipe, move, price" },
  { id: "checkout", label: "Buy & negotiate", href: "/studio/checkout", icon: ShoppingBag, hint: "Orders & offers" },
] as const;

export function Stepper() {
  const path = usePathname();
  const status = useStudio(useShallow((s) => stepStatus(s)));
  return (
    <Glass as="nav" className="p-3 lg:p-4 flex lg:flex-col gap-1 lg:gap-1.5 overflow-x-auto lg:overflow-visible">
      <Link href="/" className="hidden lg:flex items-center gap-2 px-2 pb-3 mb-1 border-b hairline">
        <span className="w-8 h-8 rounded-full grid place-items-center" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}><Home size={15} /></span>
        <span className="display text-lg">Atelier</span>
      </Link>
      {STEPS.map((s, i) => {
        const active = path.startsWith(s.href);
        const done = status[s.id as keyof typeof status];
        const Icon = s.icon;
        return (
          <Link key={s.id} href={s.href}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-[calc(var(--radius)*.6)] shrink-0 transition-all"
            style={{ background: active ? "var(--glass-strong)" : "transparent", boxShadow: active ? "inset 0 1px 0 var(--glass-highlight)" : undefined }}>
            <span className="relative w-8 h-8 rounded-full grid place-items-center text-[11px] mono shrink-0 transition-colors"
              style={{ background: active ? "var(--accent)" : "color-mix(in oklab, var(--ink) 8%, transparent)", color: active ? "var(--accent-ink)" : "var(--ink)" }}>
              {done && !active ? <Check size={14} /> : <Icon size={14} />}
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full grid place-items-center text-[9px]" style={{ background: "var(--bg)", color: "var(--ink-muted)" }}>{i + 1}</span>
            </span>
            <span className="hidden lg:block leading-tight">
              <span className="block text-sm font-medium">{s.label}</span>
              <span className="block text-[11px] muted">{s.hint}</span>
            </span>
          </Link>
        );
      })}
    </Glass>
  );
}
