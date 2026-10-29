
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";

type HistoryItem = {
  id?: string | number;
  repository?: string | {
    name?: string;
    fullname?: string;
    url?: string;
    description?: string;
    language?: string;
    stars?: number;
    forks?: number;
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
  optimizations?: number;
  recommendations?: string[];
  optimizedCode?: string;
};

function getName(item: HistoryItem) {
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

function getDetails(item: HistoryItem) {
  return [
    `Name: ${getName(item)}`,
    `Type: ${item.type ?? "Code analysis"}`,
    `Language: ${
  item.language ??
  (typeof item.repository === "object" && item.repository !== null
    ? item.repository.language
    : undefined) ??
  "Not specified"
}`,
    `Score: ${typeof item.score === "number" ? `${item.score}/100` : "Not available"}`,
    `Bugs: ${item.bugs ?? "Not available"}`,
    `Security issues: ${item.securityIssues ?? "Not available"}`,
    `Optimization opportunities: ${item.optimizations ?? "Not available"}`,
    `Date: ${item.date ?? item.timestamp ?? "Not available"}`,
    "",
    "Summary:",
    item.summary ?? "No summary available.",
    "",
    "Recommendations:",
    ...(item.recommendations?.length
      ? item.recommendations.map((recommendation) => `- ${recommendation}`)
      : ["No recommendations saved."]),
    "",
    "Optimized Code:",
    item.optimizedCode ?? "No optimized code saved.",
  ];
}

export default function ReportsPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("codelens-analysis-history");
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setHistory(parsed as HistoryItem[]);
      }
    } catch {
      setError("Could not read saved analysis history.");
    }
  }, []);

  function downloadReport(item: HistoryItem, index: number) {
    try {
      const doc = new jsPDF();
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const lines = getDetails(item);
      let y = 20;

      doc.setFontSize(20);
      doc.text("CodeLens AI Report", margin, y);
      y += 12;

      doc.setFontSize(11);

      for (const line of lines) {
        const wrapped = doc.splitTextToSize(
          line,
          pageWidth - margin * 2
        );

        for (const part of wrapped) {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = 20;
          }

          doc.text(part, margin, y);
          y += 6;
        }
      }

      doc.save(`codelens-report-${index + 1}.pdf`);
    } catch {
      setError("PDF generation failed. Please try again.");
    }
  }

  return (
    <section className="mx-auto min-h-screen max-w-6xl px-6 py-10 text-slate-100 md:px-10">
      <p className="text-sm font-semibold tracking-widest text-cyan-400">
        CODELENS AI / REPORTS
      </p>

      <h1 className="mt-3 text-3xl font-bold">Analysis Reports</h1>

      <p className="mt-3 text-slate-400">
        View saved analyses and export them as PDF reports.
      </p>

      {error && (
        <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mt-8 space-y-4">
        {history.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <h2 className="font-semibold">No reports available yet</h2>
            <p className="mt-2 text-sm text-slate-400">
              Run an analysis first to create a saved report.
            </p>
            <Link
              href="/code-analyzer"
              className="mt-5 inline-block rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950"
            >
              Analyze Code
            </Link>
          </div>
        ) : (
          history.map((item, index) => (
            <article
              key={item.id ?? index}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div>
                <h2 className="font-semibold">{getName(item)}</h2>
                <p className="mt-2 text-sm text-slate-400">
                  {item.language ?? item.type ?? "Code analysis"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {item.date ?? item.timestamp ?? "Date not saved"}
                </p>
                {typeof item.score === "number" && (
                  <p className="mt-2 text-sm text-cyan-400">
                    Score: {item.score}/100
                  </p>
                )}
              </div>

              <button
                onClick={() => downloadReport(item, index)}
                className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-300"
              >
                Download PDF
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
