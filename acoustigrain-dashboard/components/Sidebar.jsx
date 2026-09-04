"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: GridIcon },
  { href: "/dashboard/heatmap", label: "Floor map", icon: MapIcon },
  { href: "/dashboard/settings", label: "Node setup", icon: TuneIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop / tablet rail */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-100 bg-paper px-4 py-6 sm:flex">
        <Brand />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>
        <div className="rounded-lg bg-husk px-3 py-3 text-xs text-ink-400">
          <p className="font-medium text-ink-600">Pilot deployment</p>
          <p className="mt-0.5">Single wedge node &middot; retail storage</p>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-ink-100 bg-paper/95 py-2 backdrop-blur sm:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-4 py-1 text-[11px] ${
              pathname === item.href ? "text-grain-600" : "text-ink-400"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-grain-500 font-display text-sm font-bold text-white">
        AG
      </span>
      <span className="font-display text-base font-semibold tracking-tight text-ink-900">
        AcoustiGrain
      </span>
    </Link>
  );
}

function NavLink({ item, active }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition ${
        active ? "bg-grain-50 text-grain-700" : "text-ink-600 hover:bg-husk"
      }`}
    >
      <item.icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

function GridIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <rect x="2.5" y="2.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MapIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M2.5 5.5 7 4l6 2 4.5-1.5v10L13 16l-6-2-4.5 1.5v-10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7 4v10M13 6v10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function TuneIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path d="M4 5h12M4 10h12M4 15h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="5" r="1.6" fill="currentColor" />
      <circle cx="14" cy="10" r="1.6" fill="currentColor" />
      <circle cx="6" cy="15" r="1.6" fill="currentColor" />
    </svg>
  );
}