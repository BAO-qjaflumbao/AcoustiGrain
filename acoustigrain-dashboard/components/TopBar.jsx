"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const TITLES = {
  "/dashboard": "Storage overview",
  "/dashboard/heatmap": "Storage floor map",
  "/dashboard/settings": "Node setup",
};

export default function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-ink-100 bg-paper px-4 py-4 sm:px-6 lg:px-10">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-400">
          Bio-acoustic infestation monitor
        </p>
        <h1 className="font-display text-lg font-semibold text-ink-900">
          {TITLES[pathname] || "Storage overview"}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-ink-800">
            {user?.displayName || user?.email}
          </p>
          <p className="text-xs text-ink-400">Operator</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-md border border-ink-100 px-3 py-1.5 text-xs font-medium text-ink-600 transition hover:border-critical/40 hover:text-critical"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}