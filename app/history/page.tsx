
"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
  id?: string | number;
  repository?: string | {
    name?: string;
    fullname?: string;
    url?: string;
  };
  repoName?: string;
  language?: string;
  date?: string;
  timestamp?: string;
  type?: string;
  score?: number;
  summary?: string;
};

function getRepositoryName(item: HistoryItem): string {
  if (typeof item.repository === "string") {
    return item.repository;
  }

  return (
    item.repository?.name ??
    item.repository?.fullname ??
    item.repoName ??
    "Code Analysis"
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("codelens-analysis-history");

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setHistory(parsed as HistoryItem[]);
        }
      }
    } catch {
      setHistory([]);
    }
  }, []);

  function clearHistory() {
    if (!window.confirm("Are you sure you want to clear analysis history?")) {
      return;
    }

    localStorage.removeItem("codelens-analysis-history");
    setHistory([]);
  }

  return (
    <section className="mx-auto min-h-screen max-w-6xl px-6 py-10 text-slate-100 md:px-10">
      <p className="text-sm font-semibold tracking-widest text-cyan-400">
        CODELENS AI / HISTORY
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analysis History</h1>
          <p className="mt-3 text-slate-400">
            View your previously saved analysis records.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
          >
            Clear History
          </button>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Saved Analyses</h2>
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm text-cyan-400">
            {history.length} records
          </span>
        </div>

        {history.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-8 text-center">
            <p className="font-medium">No analysis history found</p>
            <p className="mt-2 text-sm text-slate-400">
              Analyze code or a GitHub repository to create history records.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {history.map((item, index) => (
              <article
                key={item.id ?? index}
                className="rounded-xl border border-slate-800 bg-slate-950 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">
                      {getRepositoryName(item)}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {item.language ?? item.type ?? "Code analysis"}
                    </p>
                  </div>

                  {typeof item.score === "number" && (
                    <span className="text-sm font-semibold text-cyan-400">
                      Score: {item.score}/100
                    </span>
                  )}
                </div>

                {(item.date || item.timestamp) && (
                  <p className="mt-3 text-xs text-slate-500">
                    {item.date ?? item.timestamp}
                  </p>
                )}

                {item.summary && (
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {item.summary}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
