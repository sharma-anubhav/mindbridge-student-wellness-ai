"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/",           label: "Home",      icon: "🏠" },
  { href: "/assessment", label: "Check-In",  icon: "📋" },
  { href: "/results",    label: "Insight",   icon: "📊" },
  { href: "/chat",       label: "AI Guide",  icon: "💬" },
  { href: "/fairness",   label: "Fairness",  icon: "⚖️" },
];

function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("mb-theme") ?? "dark") as "dark" | "light";
  });

  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("mb-theme", next);
  }, [theme]);

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-bg3 border border-border text-base
                 hover:bg-brand/10 hover:border-brand/40 transition-all duration-200"
      title="Toggle theme"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

export default function Navbar() {
  const path = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-fg hover:text-brand transition-colors">
          <span className="text-xl">🌿</span>
          <span className="tracking-tight">MindBridge</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
                path === n.href
                  ? "bg-brand/15 text-brand font-semibold"
                  : "text-fg3 hover:text-fg hover:bg-bg3"
              )}
            >
              {n.icon} {n.label}
            </Link>
          ))}
        </div>

        {/* Right: theme + mobile menu */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-border/40 flex overflow-x-auto">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "flex-1 min-w-max flex flex-col items-center gap-0.5 py-2 px-3 text-xs font-medium transition-colors",
              path === n.href ? "text-brand" : "text-fg3"
            )}
          >
            <span className="text-base">{n.icon}</span>
            <span>{n.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
