"use client";
import { useEffect } from "react";
import { useStudio } from "@/lib/store";
import { moodById, paletteById } from "@/lib/moods";
import { applyTheme, deriveTheme } from "@/lib/theme";

/** Re-skins the whole app whenever the palette or mood changes. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const moodId = useStudio((s) => s.design.moodId);
  const paletteId = useStudio((s) => s.design.paletteId);
  const custom = useStudio((s) => s.design.customPalettes);
  useEffect(() => {
    applyTheme(deriveTheme(paletteById(paletteId, custom), moodById(moodId)));
  }, [moodId, paletteId, custom]);
  return <>{children}</>;
}
