"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

type ArchitectureDiagramProps = {
    code: string;
    flowchart: string;
};

export default function ArchitectureDiagram({
    code,
    flowchart,
}: ArchitectureDiagramProps) {
    const diagramRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            securityLevel: "loose",
            themeVariables: {
                primaryColor: "#0e7490",
                primaryTextColor: "#ffffff",
                primaryBorderColor: "#22d3ee",
                lineColor: "#94a3b8",
                secondaryColor: "#1e293b",
                tertiaryColor: "#0f172a",
            },
        });

        const renderDiagram = async () => {
            if (!diagramRef.current || !flowchart) return;

            try {
                let diagram = flowchart.trim();

                // Remove markdown code fences if AI accidentally adds them
                diagram = diagram
                    .replace(/^```mermaid\s*/i, "")
                    .replace(/^```\s*/i, "")
                    .replace(/\s*```$/i, "")
                    .trim();

                // Make sure Mermaid receives valid flowchart syntax
                if (!/^flowchart\s+(LR|RL|TB|BT|TD)\b/i.test(diagram)) {
                    diagram = `flowchart LR
                   ${diagram}`;
                }

                const id = `codelens-${Date.now()}`;

                const { svg } = await mermaid.render(id, diagram);

                if (diagramRef.current) {
                    diagramRef.current.innerHTML = svg;
                }
            } catch (error) {
                console.error("Mermaid render error:", error);

                if (diagramRef.current) {
                    diagramRef.current.innerHTML = `
            <p style="color:#94a3b8; text-align:center;">
              Unable to generate architecture diagram.
            </p>
          `;
                }
            }
        };

        renderDiagram();
    }, [flowchart]);

    return (
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
            <h3 className="mb-6 text-lg font-semibold text-cyan-400">
                📊 Code Architecture
            </h3>

            <div
                ref={diagramRef}
                className="flex min-h-[180px] w-full items-center justify-center overflow-x-auto"
            >
                {!flowchart && (
                    <p className="text-sm text-slate-500">
                        Architecture diagram will appear after analysis.
                    </p>
                )}
            </div>
        </div>
    );
}