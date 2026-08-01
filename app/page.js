"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [user, initializing, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-paper">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-grain-200 border-t-grain-500" />
        <p className="font-mono text-xs uppercase tracking-widest text-ink-400">
          Loading AcoustiGrain
        </p>
      </div>
    </div>
  );
}
