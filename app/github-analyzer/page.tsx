
"use client";

import { useState } from "react";

export default function GitHubAnalyzerPage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function analyzeRepository() {
    setError("");
    setResult(null);

    const match = url.trim().match(
      /^https:\/\/github\.com\/([^/\s]+)\/([^/\s?#]+)\/?$/
    );

    if (!match) {
      setError("Enter a valid public GitHub repository URL.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Repository analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Analysis failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl p-6 md:p-10">
      <p className="text-sm font-medium text-cyan-400">
        CODELENS AI / GITHUB
      </p>

      <h1 className="mt-3 text-3xl font-bold text-white">
        GitHub Repository Analyzer
      </h1>

      <p className="mt-3 text-slate-400">
        Analyze a repository for code quality, bugs, security issues,
        and optimization opportunities.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <label
          htmlFor="github-url"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          GitHub Repository URL
        </label>

        <input
          id="github-url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://github.com/owner/repository"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
        />

        <button
          type="button"
          onClick={analyzeRepository}
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
        >
          {loading ? "Analyzing repository..." : "Analyze Repository"}
        </button>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>

      
{result && (
  <div className="mt-6 space-y-6">
    <div>
      <p className="text-sm font-semibold tracking-widest text-cyan-400">
        REPOSITORY ANALYSIS
      </p>
      <h2 className="mt-2 text-2xl font-bold">
        {typeof result.repository === "object" &&
        result.repository !== null &&
        "name" in result.repository &&
        typeof result.repository.name === "string"
          ? result.repository.name
          : "Repository Results"}
      </h2>
      <p className="mt-2 text-slate-400">
        {typeof result.repository === "object" &&
        result.repository !== null &&
        "description" in result.repository &&
        typeof result.repository.description === "string"
          ? result.repository.description
          : "Review your repository details and analysis response."}
      </p>
    </div>

    {typeof result.repository === "object" &&
      result.repository !== null && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Language",
              value:
                "language" in result.repository
                  ? result.repository.language
                  : undefined,
            },
            {
              label: "Stars",
              value:
                "stars" in result.repository
                  ? result.repository.stars
                  : undefined,
            },
            {
              label: "Forks",
              value:
                "forks" in result.repository
                  ? result.repository.forks
                  : undefined,
            },
            {
              label: "Status",
              value: result.success === true ? "Success" : "Completed",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 break-words text-xl font-bold text-cyan-400">
                {item.value == null ? "Not available" : String(item.value)}
              </p>
            </div>
          ))}
        </div>
      )}

    {typeof result.repository === "object" &&
      result.repository !== null &&
      "url" in result.repository &&
      typeof result.repository.url === "string" && (
        <a
          href={result.repository.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
        >
          Open GitHub Repository →
        </a>
      )}

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="text-lg font-semibold text-cyan-400">
        Complete API Response
      </h3>
      <p className="mt-2 text-sm text-slate-400">
        Detailed response returned by your existing GitHub API.
      </p>
      <pre className="mt-4 max-h-[500px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-4 text-sm text-slate-300">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  </div>
)}

    </section>
  );
}
