"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function DashboardLayout({ children }) {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !user) {
      router.replace("/login");
    }
  }, [user, initializing, router]);

  if (initializing || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-grain-200 border-t-grain-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
