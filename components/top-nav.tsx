"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-neutral-900 text-xs font-bold text-white">
            S
          </div>
          <span className="text-sm font-semibold tracking-tight">SignalRank</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              pathname === "/"
                ? "bg-neutral-100 font-medium text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            Segments
          </Link>
          <Link
            href="/projects/new"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              pathname === "/projects/new"
                ? "bg-neutral-100 font-medium text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            New
          </Link>
        </nav>
      </div>
    </header>
  );
}
