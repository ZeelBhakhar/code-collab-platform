import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type Finding = {
  title: string;
  description: string;
  line: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  suggestion: string;
};

export async function POST(request: Request) {
  try {
    // --------------------------------------------------
    // 1. Get GitHub URL
    // --------------------------------------------------
    const { url } = await request.json();

    if (!url || !url.trim()) {
      return NextResponse.json(
        { error: "GitHub repository URL is required" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 2. Extract owner and repository name
    // --------------------------------------------------
    let githubUrl: URL;

    try {
      githubUrl = new URL(url.trim());
    } catch {
      return NextResponse.json(
        { error: "Please enter a valid GitHub repository URL" },
        { status: 400 }
      );
    }

    if (githubUrl.hostname !== "github.com") {
      return NextResponse.json(
        { error: "Please enter a valid GitHub repository URL" },
        { status: 400 }
      );
    }

    const parts = githubUrl.pathname
      .split("/")
      .filter(Boolean);

    if (parts.length < 2) {
      return NextResponse.json(
        { error: "Please enter a valid GitHub repository URL" },
        { status: 400 }
      );
    }

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, "");

    // --------------------------------------------------
    // 3. Get repository information
    // --------------------------------------------------
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
        cache: "no-store",
      }
    );

    if (!repoResponse.ok) {
      return NextResponse.json(
        {
          error:
            "GitHub repository not found or is not public",
        },
        { status: repoResponse.status }
      );
    }

    const repository = await repoResponse.json();

    // --------------------------------------------------
    // 4. Get repository file tree
    // --------------------------------------------------
    const branch = repository.default_branch || "main";

    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(
        branch
      )}?recursive=1`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
        cache: "no-store",
      }
    );

    if (!treeResponse.ok) {
      return NextResponse.json(
        {
          error: "Unable to read repository files",
        },
        { status: treeResponse.status }
      );
    }

    const treeData = await treeResponse.json();

    // --------------------------------------------------
    // 5. Select useful source files
    // --------------------------------------------------
    const allowedExtensions = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".h",
  ".cs",
  ".go",
  ".rs",
  ".php",
  ".rb",
  ".swift",
  ".kt",
  ".kts",
  ".sh",
  ".bash",
  ".zsh",
  ".md",
  ".json",
  ".yaml",
  ".yml",
  ".toml"
];

    const ignoredFolders = [
      "node_modules/",
      ".next/",
      "dist/",
      "build/",
      "coverage/",
      ".git/",
      "vendor/",
    ];

    const files = (treeData.tree || [])
  .filter(
    (item: { type: string; path: string }) =>
      item.type === "blob" &&
      allowedExtensions.some((ext) =>
        item.path.toLowerCase().endsWith(ext)
      ) &&
      !ignoredFolders.some((folder) =>
        item.path.toLowerCase().startsWith(folder)
      )
  )
  .sort((a: { path: string }, b: { path: string }) => {
    const priority = (path: string) => {
      const lower = path.toLowerCase();

      if (
        lower.includes("/api/") ||
        lower.includes("/routes/") ||
        lower.includes("/controllers/")
      ) {
        return 1;
      }

      if (
        lower.startsWith("src/") ||
        lower.startsWith("app/") ||
        lower.startsWith("server.")
      ) {
        return 2;
      }

      if (
        lower.includes("component") ||
        lower.includes("service") ||
        lower.includes("middleware")
      ) {
        return 3;
      }

      if (
        lower.includes("test") ||
        lower.includes("spec")
      ) {
        return 5;
      }

      return 4;
    };

    return priority(a.path) - priority(b.path);
  })
  .slice(0, 20);

    // --------------------------------------------------
    // 6. Download source code
    // --------------------------------------------------
    const sourceFiles: string[] = [];

    for (const file of files) {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;

        const fileResponse = await fetch(rawUrl, {
          cache: "no-store",
        });

        if (!fileResponse.ok) {
          continue;
        }

        let content = await fileResponse.text();

        // Keep individual files reasonably small
        if (content.length > 20000) {
          content = content.slice(0, 20000);
          content += "\n\n[File truncated]";
        }

        sourceFiles.push(
          `===== FILE: ${file.path} =====\n${content}`
        );
      } catch (error) {
        console.error(
          `Failed to read file: ${file.path}`,
          error
        );
      }
    }

    const combinedCode =
      sourceFiles.length > 0
        ? sourceFiles.join("\n\n")
        : "No supported source files were found.";

    // --------------------------------------------------
    // 7. Ask Gemini to analyze the repository
    // --------------------------------------------------
    const prompt = `
You are an expert senior software engineer performing a complete code review.

Analyze this GitHub repository.

Repository:
Name: ${repository.name}
Description: ${repository.description || "No description"}
Primary Language: ${repository.language || "Unknown"}
Stars: ${repository.stargazers_count}
Forks: ${repository.forks_count}

Analyze the ACTUAL SOURCE CODE provided below.

Return ONLY valid JSON.
Do not use markdown.
Do not wrap the JSON in \`\`\` blocks.

The JSON must have EXACTLY this structure:

{
  "score": 0,
  "summary": "short repository summary",
  "bugs": [],
  "bugDetails": [],
  "securityIssues": 0,
  "securityDetails": [],
  "optimizations": 0,
  "complexity": "time and space complexity explanation",
  "recommendations": [],
  "optimizedCode": "most important optimized code example",
  "flowchart": "Mermaid flowchart"
}

For "score":
- Give a code quality score from 0 to 100.

For "bugs":
- Return an array of bug objects.
- Each object must contain:
  title
  description
  line
  severity
  suggestion

For "bugDetails":
- Return the same detailed bug objects.

For "securityIssues":
- Return the NUMBER of security issues.

For "securityDetails":
- Return an array of detailed security finding objects.
- Each object must contain:
  title
  description
  line
  severity
  suggestion

For "optimizations":
- Return the NUMBER of meaningful optimization opportunities.

For "complexity":
- Explain the important time and space complexity.

For "recommendations":
- Return an array of practical improvement recommendations.

For "optimizedCode":
- Provide an improved version of the most important code section.
- If no meaningful optimization is possible, return the original important section.

For "flowchart":
- Return a valid Mermaid flowchart.
- Keep it simple.
- Use syntax like:
  flowchart TD
    A[Start] --> B[Process]
    B --> C[End]

Severity must be one of:
Low
Medium
High
Critical

Repository source code:

${combinedCode}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    // --------------------------------------------------
    // 8. Parse Gemini response
    // --------------------------------------------------
    let resultText = response.text || "";

    resultText = resultText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let result;

    try {
      result = JSON.parse(resultText);
    } catch (error) {
      console.error("Gemini JSON Parse Error:", error);
      console.error("Gemini Response:", resultText);

      return NextResponse.json(
        {
          error: "AI returned an invalid analysis format",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 9. Normalize result
    // --------------------------------------------------
    const bugs: Finding[] = Array.isArray(result.bugs)
      ? result.bugs
      : [];

    const bugDetails: Finding[] = Array.isArray(
      result.bugDetails
    )
      ? result.bugDetails
      : bugs;

    const securityDetails: Finding[] = Array.isArray(
      result.securityDetails
    )
      ? result.securityDetails
      : [];

    const recommendations: string[] = Array.isArray(
      result.recommendations
    )
      ? result.recommendations
      : [];

    // --------------------------------------------------
    // 10. Return repository + AI analysis
    // --------------------------------------------------
    return NextResponse.json({
      success: true,

      repository: {
        name: repository.name,
        fullName: repository.full_name,
        description: repository.description,
        language: repository.language,
        stars: repository.stargazers_count,
        forks: repository.forks_count,
        url: repository.html_url,
      },

      score:
        typeof result.score === "number"
          ? result.score
          : 0,

      summary:
        result.summary ||
        "Repository analysis completed.",

      bugs,

      bugDetails,

      securityIssues:
        typeof result.securityIssues === "number"
          ? result.securityIssues
          : securityDetails.length,

      securityDetails,

      optimizations:
        typeof result.optimizations === "number"
          ? result.optimizations
          : 0,

      complexity:
        result.complexity ||
        "Complexity information is not available.",

      recommendations,

      optimizedCode:
        result.optimizedCode ||
        "No optimized code available.",

      flowchart:
        result.flowchart ||
        `flowchart TD
    A[Repository] --> B[Source Code]
    B --> C[AI Analysis]
    C --> D[Results]`,

      analyzedFiles: sourceFiles.length,
    });
  } catch (error) {
    console.error("GitHub API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to analyze GitHub repository",
      },
      { status: 500 }
    );
  }
}