"use client";
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useStudio } from "@/lib/store";
import type { ConnectorId } from "@/lib/types";

/** Picks up `?connected=<provider>` after an OAuth round-trip on any studio page. */
export function ConnectorCatcher() {
  const params = useSearchParams(); const router = useRouter(); const path = usePathname();
  const connectors = useStudio((s) => s.connectors); const setConnector = useStudio((s) => s.setConnector);
  useEffect(() => {
    const c = params.get("connected") as ConnectorId | null;
    if (c && connectors[c]) {
      if (!connectors[c].connected) setConnector(c, { connected: true, account: params.get("account") ?? "demo user", connectedAt: Date.now() });
      router.replace(path);
    }
  }, [params, connectors, setConnector, router, path]);
  return null;
}
