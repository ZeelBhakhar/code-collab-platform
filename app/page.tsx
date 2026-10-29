
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type HistoryItem = {
  id?: string | number;
  repository?:
    | string
    | {
        language: string;
        name?: string;
        fullname?: string;
        fullName?: string;
        url?: string;
      };
  repoName?: string;
  language?: string;
  date?: string;
  timestamp?: string;
  type?: string;
  score?: number;
summary?: string;
bugs?: number;
securityIssues?: number;
};

export default function Dashboard() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("codelens-analysis-history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch {
      setHistory([]);
    }
  }, []);

  const recent = history.slice(0, 5);

  const actions = [
    {
      title: "GitHub Analyzer",
      description: "Analyze a GitHub repository",
      href: "/github-analyzer",
      icon: "⌘",
    },
    {
      title: "Code Analyzer",
      description: "Review code for issues and improvements",
      href: "/code-analyzer",
      icon: "</>",
    },
    {
      title: "Architecture",
      description: "Explore code structure and flow",
      href: "/architecture",
      icon: "⑂",
    },
    {
      title: "Reports",
      description: "Access your analysis reports",
      href: "/reports",
      icon: "▤",
    },
  ];

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-slate-100 md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
          CODELENS AI / OVERVIEW
        </p>

        <h1 className="mt-3 text-3xl font-bold md:text-4xl">
          Dashboard
        </h1>

        <p className="mt-3 text-slate-400">
          Your workspace for intelligent code analysis.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Saved Analyses</p>
            <p className="mt-3 text-3xl font-bold text-cyan-400">
              {history.length}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              From your local analysis history
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Recent Activity</p>
            <p className="mt-3 text-3xl font-bold">
              {recent.length}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Latest saved analysis records
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:col-span-2 xl:col-span-1">
            <p className="text-sm text-slate-400">Analysis Workspace</p>
            <p className="mt-3 text-xl font-bold">Ready to use</p>
            <Link
              href="/github-analyzer"
              className="mt-4 inline-flex rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Analyze Repository →
            </Link>
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-400">
              Choose what you want to analyze.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-400/60 hover:bg-slate-900/80"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 font-bold text-cyan-400">
                  {action.icon}
                </div>
                <h3 className="mt-4 font-semibold group-hover:text-cyan-400">
                  {action.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {action.description}
                </p>
                <p className="mt-4 text-sm font-medium text-cyan-400">
                  Open tool →
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Recent Activity</h2>
              <p className="mt-1 text-sm text-slate-400">
                Your latest saved analysis records.
              </p>
            </div>

            <Link
              href="/history"
              className="text-sm font-semibold text-cyan-400 hover:text-cyan-300"
            >
              View History →
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-8 text-center">
              <p className="font-medium">No saved analyses yet</p>
              <p className="mt-2 text-sm text-slate-400">
                Analyze a repository or code file to get started.
              </p>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-slate-800">
              
{recent.map((item, index) => (
  <div
    key={item.id ?? index}
    className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 py-5 last:border-0"
  >
    <div className="min-w-0 flex-1">
      <p className="break-words font-semibold text-slate-100">
        {typeof item.repository === "string"
          ? item.repository
          : item.repository?.name ??
            item.repository?.fullname ??
            item.repoName ??
            "Code Analysis"}
      </p>

      <p className="mt-1 text-sm text-slate-400">
        {item.language ??
          (typeof item.repository === "object" &&
          item.repository !== null
            ? item.repository.language
            : undefined) ??
          item.type ??
          "Code analysis"}
      </p>

      {item.summary && (
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {item.summary}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {typeof item.score === "number" && (
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-400">
            Score: {item.score}/100
          </span>
        )}

        {typeof item.bugs === "number" && (
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
            Bugs: {item.bugs}
          </span>
        )}

        {typeof item.securityIssues === "number" && (
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
            Security: {item.securityIssues}
          </span>
        )}
      </div>
    </div>

    <p className="text-xs text-slate-500">
      {item.date ?? item.timestamp ?? ""}
    </p>
  </div>
))}

            </div>
          )}
        </section>
      </div>
    </div>
  );
}
