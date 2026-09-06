"use client";
import { forwardRef, useCallback, type CSSProperties, type HTMLAttributes, type MouseEvent } from "react";

type GlassProps = HTMLAttributes<HTMLDivElement> & { strong?: boolean; lift?: boolean; pill?: boolean; as?: "div" | "section" | "aside" | "nav" | "header" };

/** Liquid-glass surface with a pointer-tracking specular highlight. */
export const Glass = forwardRef<HTMLDivElement, GlassProps>(function Glass({ strong, lift, pill, className = "", style, onMouseMove, children, ...rest }, ref) {
  const track = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget; const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    onMouseMove?.(e);
  }, [onMouseMove]);
  return (
    <div ref={ref} onMouseMove={track} style={style as CSSProperties}
      className={`${strong ? "glass-strong" : "glass"} ${lift ? "glass-lift" : ""} ${pill ? "glass-pill" : ""} ${className}`} {...rest}>
      {children}
    </div>
  );
});

export function Button({ variant = "glass", size, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "glass" | "accent" | "ghost"; size?: "sm" | "xs" }) {
  return <button className={`btn ${variant === "accent" ? "btn-accent" : variant === "ghost" ? "btn-ghost" : ""} ${size === "sm" ? "btn-sm" : size === "xs" ? "btn-xs" : ""} ${className}`} {...rest} />;
}

export function Chip({ on, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean }) {
  return <button type="button" className={`chip ${on ? "chip-on" : ""} ${className}`} {...rest} />;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input ${props.className ?? ""}`} />;
}

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mono text-[11px] uppercase tracking-[0.22em] muted ${className}`}>{children}</div>;
}
