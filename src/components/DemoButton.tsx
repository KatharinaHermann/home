"use client";
import { useRouter } from "next/navigation";
import { useStudio } from "@/lib/store";

export function DemoButton({ className = "btn", children }: { className?: string; children: React.ReactNode }) {
  const router = useRouter(); const loadDemo = useStudio((s) => s.loadDemo); const rooms = useStudio((s) => s.rooms);
  return <button className={className} onClick={() => { if (rooms.length === 0) loadDemo(); router.push("/studio/tour"); }}>{children}</button>;
}
