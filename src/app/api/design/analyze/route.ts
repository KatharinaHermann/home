import { NextRequest } from "next/server";
import { z } from "zod";
import { analyzeMoodboard } from "@/lib/ai/claude";

const Body = z.object({
  images: z.array(z.object({ dataUrl: z.string() })).default([]),
  notes: z.array(z.string()).default([]),
  urls: z.array(z.string()).default([]),
  extractedColors: z.array(z.string()).default([]),
});

/** Mood board → design language (mood, keywords, materials, palette). */
export async function POST(req: NextRequest) {
  const body = Body.parse(await req.json());
  const out = await analyzeMoodboard(body);
  return Response.json(out);
}
