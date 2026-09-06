import { NextRequest } from "next/server";
import { z } from "zod";
import { parseSketch } from "@/lib/ai/claude";

const Body = z.object({ images: z.array(z.object({ dataUrl: z.string() })).default([]), hint: z.string().optional() });

/** Sketch / photos → apartment model. */
export async function POST(req: NextRequest) {
  const body = Body.parse(await req.json());
  return Response.json(await parseSketch(body));
}
