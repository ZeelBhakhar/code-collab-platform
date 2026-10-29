
"use client";

import { useState } from "react";
import ArchitectureDiagram from "../ArchitectureDiagram";

export default function ArchitecturePage() {
  const [code, setCode] = useState("");
  const [flowchart, setFlowchart] = useState("");
  const [error, setError] = useState("");

  async function generateArchitecture() {
    if (!code.trim()) {
      setError("Please paste your source code first.");
      return;
    }

    setError("");
    setFlowchart("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: "python",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Architecture generation failed.");
      }

      if (typeof data.flowchart !== "string" || !data.flowchart.trim()) {
        throw new Error(
          "The analysis API did not return a flowchart definition."
        );
      }

      setFlowchart(data.flowchart);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  return (
    <section className="mx-auto min-h-screen max-w-6xl px-6 py-10 text-slate-100 md:px-10">
      <p className="text-sm font-semibold tracking-widest text-cyan-400">
        CODELENS AI / ARCHITECTURE
      </p>

      <h1 className="mt-3 text-3xl font-bold">
        Architecture Explorer
      </h1>

      <p className="mt-3 text-slate-400">
        Analyze your code and view its generated flowchart.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <label
          htmlFor="architecture-code"
          className="mb-3 block text-sm font-medium"
        >
          Source Code
        </label>

        <textarea
          id="architecture-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Paste your source code here..."
          spellCheck={false}
          className="min-h-64 w-full rounded-lg border border-slate-700 bg-slate-950 p-4 font-mono text-sm outline-none focus:border-cyan-400"
        />

        <button
          onClick={generateArchitecture}
          className="mt-4 rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
        >
          Generate Architecture
        </button>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}
      </div>

      {flowchart && (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-5 text-xl font-semibold text-cyan-400">
            Generated Architecture
          </h2>

          <ArchitectureDiagram code={code} flowchart={flowchart} />
        </div>
      )}
    </section>
  );
}
