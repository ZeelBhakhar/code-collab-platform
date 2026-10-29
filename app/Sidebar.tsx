
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/", icon: "⌂" },
  { label: "GitHub Analyzer", href: "/github-analyzer", icon: "⌘" },
  { label: "Code Analyzer", href: "/code-analyzer", icon: "</>" },
  { label: "Architecture", href: "/architecture", icon: "⑂" },
  { label: "Analysis History", href: "/history", icon: "◷" },
  { label: "Reports", href: "/reports", icon: "▤" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-200 md:flex">
      <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-xl font-bold text-cyan-400">
          C
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-wide text-white">
            CodeLens AI
          </h2>
          <p className="text-xs text-slate-400">
            Intelligent Code Analysis
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Workspace
        </p>

        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? "border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="w-7 text-center text-lg">
                {item.icon}
              </span>
              <span>{item.label}</span>

              {active && (
                <span className="ml-auto h-2 w-2 rounded-full bg-cyan-400" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="rounded-xl bg-slate-900 p-4">
          <p className="text-sm font-medium text-white">
            CodeLens AI
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Analyze. Improve. Build.
          </p>
        </div>
      </div>
    </aside>
  );
}
