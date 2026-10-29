"use client";

import { useState } from "react";


type AnalysisResult = {
  score?: number;
  summary?: string;
  bugs?: number;
  bugDetails?: unknown[];
  securityIssues?: number;
  securityDetails?: unknown[];
  optimizations?: number;
  complexity?: string;
  recommendations?: string[];
  optimizedCode?: string;
  flowchart?: string;
};

export default function CodeAnalyzerPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyzeCode() {
    if (!code.trim()) {
      setError("Please enter some code first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Analysis failed. Please try again.";

        throw new Error(message);
      }

      
const analysis = data as AnalysisResult;
setResult(analysis);

const historyItem = {
  id: Date.now(),
  repository: "Code Analysis",
  repoName: "Code Analysis",
  language,
  type: "Code analysis",
  date: new Date().toLocaleString(),
  timestamp: new Date().toISOString(),
  score: analysis.score,
  summary: analysis.summary,
  bugs: analysis.bugs,
  securityIssues: analysis.securityIssues,
  optimizations: analysis.optimizations,
};

try {
  const saved = localStorage.getItem("codelens-analysis-history");
  const previous = saved ? JSON.parse(saved) : [];

  const history = Array.isArray(previous) ? previous : [];

  localStorage.setItem(
    "codelens-analysis-history",
    JSON.stringify([historyItem, ...history])
  );
} catch (storageError) {
  console.error("Could not save analysis history:", storageError);
}

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto min-h-screen max-w-6xl px-6 py-10 text-slate-100 md:px-10">
      <p className="text-sm font-semibold tracking-widest text-cyan-400">
        CODELENS AI / CODE ANALYZER
      </p>

      <h1 className="mt-3 text-3xl font-bold">
        Code Analyzer
      </h1>

      <p className="mt-3 text-slate-400">
        Review your source code for potential issues and improvements.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <label
          htmlFor="language"
          className="mb-2 block text-sm font-medium"
        >
          Programming Language
        </label>

        <select
          id="language"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="mb-5 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
        </select>

        <label
          htmlFor="source-code"
          className="mb-2 block text-sm font-medium"
        >
          Your Code
        </label>

        <textarea
          id="source-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Paste your source code here..."
          spellCheck={false}
          className="min-h-72 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-4 font-mono text-sm text-slate-100 outline-none focus:border-cyan-400"
        />

        <button
          type="button"
          onClick={analyzeCode}
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Analyzing Code..." : "Analyze Code"}
        </button>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}
      </div>

      
{result !== null && (
  <div className="mt-6 space-y-6">
    <div>
      <p className="text-sm font-semibold tracking-widest text-cyan-400">
        ANALYSIS COMPLETE
      </p>
      <h2 className="mt-2 text-2xl font-bold">Analysis Results</h2>
      <p className="mt-2 text-slate-400">{result.summary ?? "No summary available."}</p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { label: "Quality Score", value: result.score ?? "N/A", suffix: typeof result.score === "number" ? "/100" : "" },
        { label: "Bugs", value: result.bugs ?? "N/A", suffix: "" },
        { label: "Security Issues", value: result.securityIssues ?? "N/A", suffix: "" },
        { label: "Optimizations", value: result.optimizations ?? "N/A", suffix: "" },
      ].map((metric) => (
        <div key={metric.label} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">{metric.label}</p>
          <p className="mt-3 text-3xl font-bold text-cyan-400">
            {metric.value}{metric.suffix}
          </p>
        </div>
      ))}
    </div>

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="text-lg font-semibold">Complexity Analysis</h3>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
        {result.complexity ?? "Complexity information not available."}
      </p>
    </div>

    {[
      { title: "Bug Details", items: result.bugDetails },
      { title: "Security Details", items: result.securityDetails },
    ].map((section) => (
      <div key={section.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-lg font-semibold">{section.title}</h3>
        {!section.items?.length ? (
          <p className="mt-3 text-sm text-slate-400">No details reported.</p>
        ) : (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
            {section.items.map((item, index) => (
              <li key={index}>
                {typeof item === "string" ? item : JSON.stringify(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    ))}

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="text-lg font-semibold">Recommendations</h3>
      {!result.recommendations?.length ? (
        <p className="mt-3 text-sm text-slate-400">No recommendations available.</p>
      ) : (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300">
          {result.recommendations.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>

    {result.optimizedCode && (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Optimized Code</h3>
          <button
            onClick={() => {
              void navigator.clipboard.writeText(result.optimizedCode ?? "");
            }}
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Copy Code
          </button>
        </div>
        <pre className="mt-4 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-200">
          {result.optimizedCode}
        </pre>
      </div>
    )}

    {result.flowchart && (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-lg font-semibold">Flowchart Definition</h3>
        <pre className="mt-4 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-200">
          {result.flowchart}
        </pre>
      </div>
    )}
  </div>
)}

    </section>
  );
}
