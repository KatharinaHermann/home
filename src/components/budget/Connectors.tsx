"use client";
import { Store, Link2, ShieldCheck, Unplug } from "lucide-react";
import { Glass, Eyebrow } from "@/components/glass/Glass";
import { useStudio } from "@/lib/store";
import type { ConnectorId } from "@/lib/types";

const LIST: { id: ConnectorId; label: string; scopes: string; icon: React.ReactNode; note: string }[] = [
  { id: "facebook", label: "Facebook Marketplace", scopes: "public_profile · marketplace search · messaging", icon: <Store size={16} />, note: "Search listings near you and let the agent message sellers on your behalf." },
  { id: "kleinanzeigen", label: "Kleinanzeigen", scopes: "search · messaging (companion)", icon: <Link2 size={16} />, note: "Germany's biggest classifieds. Runs through the browser companion." },
  { id: "amazon", label: "Amazon", scopes: "product search · 1-click ordering", icon: <Link2 size={16} />, note: "Product Advertising API for search; orders via your session." },
  { id: "ikea", label: "IKEA", scopes: "catalogue · availability", icon: <Link2 size={16} />, note: "Stock at your nearest store, click & collect." },
];

export function Connectors() {
  const connectors = useStudio((s) => s.connectors); const setConnector = useStudio((s) => s.setConnector);
  return (
    <Glass className="p-5">
      <div className="flex items-center justify-between mb-3"><Eyebrow>Sources & authorisations</Eyebrow><span className="chip"><ShieldCheck size={11} /> OAuth · revocable</span></div>
      <div className="space-y-2">
        {LIST.map((c) => {
          const st = connectors[c.id];
          return (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-[calc(var(--radius)*.6)]" style={{ background: "color-mix(in oklab, var(--ink) 5%, transparent)" }}>
              <span className="w-9 h-9 rounded-full grid place-items-center shrink-0" style={{ background: st.connected ? "var(--accent)" : "var(--glass-strong)", color: st.connected ? "var(--accent-ink)" : "var(--ink)" }}>{c.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{c.label} {st.connected && <span className="muted text-xs">· {st.account}</span>}</div>
                <div className="muted text-[11px] truncate">{st.connected ? c.scopes : c.note}</div>
              </div>
              {st.connected
                ? <button className="btn btn-ghost btn-xs" onClick={() => setConnector(c.id, { connected: false, account: undefined })}><Unplug size={12} /> Disconnect</button>
                : <a className="btn btn-xs" href={`/api/connectors/${c.id}/authorize?return=/studio/budget`}>Connect</a>}
            </div>
          );
        })}
      </div>
    </Glass>
  );
}
