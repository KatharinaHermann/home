import { NextRequest } from "next/server";
import { z } from "zod";
import { productById, SOURCE_META } from "@/lib/catalog";
import { draftNegotiation } from "@/lib/ai/claude";
import { ndjson, sleep } from "@/lib/ndjson";
import type { AgentEvent, Connector, Order, PlacedProduct } from "@/lib/types";
import type { Room } from "@/lib/rooms";

const Body = z.object({
  items: z.array(z.custom<PlacedProduct>()),
  rooms: z.array(z.custom<Room>()),
  tone: z.enum(["friendly", "direct"]),
  discount: z.number().min(0).max(0.6),
  maxAuto: z.number().min(0),
  authOrders: z.boolean(),
  authNeg: z.boolean(),
  connectors: z.record(z.string(), z.custom<Connector>()),
});

/**
 * Checkout agent. For each confirmed item:
 *  - marketplace (used): open a negotiation thread (Messenger Platform /
 *    companion), counter within the user's limits, auto-accept under maxAuto
 *  - retailer: place an order if authorised, otherwise queue for approval
 *  - existing: nothing to do
 * Seller replies are simulated deterministically here; in production they
 * arrive via webhook and re-enter this state machine (see ARCHITECTURE.md).
 */
export async function POST(req: NextRequest) {
  const b = Body.parse(await req.json());
  async function* run(): AsyncGenerator<AgentEvent> {
    const log = (text: string): AgentEvent => ({ type: "log", text, at: Date.now() });
    const fb = !!b.connectors.facebook?.connected;
    yield log(`${b.items.length} confirmed items · negotiation opens ${Math.round(b.discount * 100)}% below asking · auto-accept ≤ €${b.maxAuto}`);
    let n = 0;
    for (const item of b.items) {
      const p = item.productId ? productById(item.productId) : null;
      if (!p) continue;
      const kind = SOURCE_META[p.source].kind;
      const id = `o-${item.key}`;
      const now = () => Date.now();
      if (p.source === "existing") { yield { type: "order", order: { id, key: item.key, productId: p.id, kind: "pickup", status: "agreed", listPrice: 0, finalPrice: 0, thread: [], authorized: true } }; continue; }

      if (kind === "marketplace" && p.condition === "used") {
        const target = Math.round(p.price * (1 - b.discount));
        const order: Order = { id, key: item.key, productId: p.id, kind: "negotiation", status: "messaging", listPrice: p.price, targetPrice: target, thread: [], authorized: b.authNeg && fb };
        yield log(`Negotiating "${p.name}" (${p.meta?.seller ?? "seller"}) · asking €${p.price} → opening at €${target}`);
        const msg = await draftNegotiation({ item: p.name, listPrice: p.price, targetPrice: target, seller: p.meta?.seller, tone: b.tone });
        order.thread.push({ from: "agent", text: msg, at: now() });
        if (!order.authorized) {
          order.status = "awaiting-auth";
          order.thread.push({ from: "system", text: fb ? "Sending disabled: enable “Agent may message sellers”." : "Draft ready. Connect Facebook Marketplace to send it from your account.", at: now() });
          yield { type: "order", order }; continue;
        }
        yield { type: "order", order: { ...order } };
        await sleep(500);
        // simulated seller behaviour: meets in the middle, sometimes holds firm
        const seed = (p.id.charCodeAt(2) + p.price) % 3;
        const counter = seed === 0 ? target : seed === 1 ? Math.round((target + p.price) / 2 / 5) * 5 : Math.round(p.price * 0.95);
        order.thread.push({ from: "seller", text: seed === 0 ? `Sure, €${counter} works if you can collect this week.` : seed === 1 ? `I could do €${counter}, it's in great condition.` : `Lowest I'd go is €${counter}, had a lot of interest.`, at: now() });
        order.status = "counter";
        yield { type: "order", order: { ...order } };
        await sleep(400);
        if (counter <= Math.max(target, b.maxAuto) || counter <= target) {
          order.finalPrice = counter; order.status = "agreed";
          order.thread.push({ from: "agent", text: `Deal at €${counter}. I'll confirm the pickup slot by message.`, at: now() });
          yield log(`Agreed "${p.name}" at €${counter} (saved €${p.price - counter})`);
        } else {
          order.finalPrice = counter; order.status = "awaiting-auth";
          order.thread.push({ from: "system", text: `Counter €${counter} exceeds your auto-accept limit (€${b.maxAuto}). Approve or let the agent walk away.`, at: now() });
          yield log(`"${p.name}": counter €${counter} needs your approval`);
        }
        yield { type: "order", order };
        n++; continue;
      }

      // retailer order
      const order: Order = { id, key: item.key, productId: p.id, kind: "order", status: b.authOrders ? "ordered" : "awaiting-auth", listPrice: item.price, finalPrice: item.price, thread: [], authorized: b.authOrders };
      order.thread.push({ from: "system", text: b.authOrders ? `Ordered from ${SOURCE_META[p.source].label} · delivery slot requested · confirmation by e-mail.` : `Added to ${SOURCE_META[p.source].label} basket. Approve to place the order.`, at: now() });
      yield log(`${b.authOrders ? "Ordered" : "Queued"} "${p.name}" from ${SOURCE_META[p.source].label} · €${item.price}`);
      yield { type: "order", order };
      await sleep(180); n++;
    }
    yield log(`Done · ${n} actions taken`);
    yield { type: "done" };
  }
  return ndjson(run());
}
