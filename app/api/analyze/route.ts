import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { code, language } = body;

    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert software engineer, security reviewer, and code optimization specialist.

Analyze the following ${language} code carefully.

Return ONLY valid JSON according to the provided schema.

IMPORTANT ANALYSIS RULES:

1. score:
- Give a realistic code quality score from 0 to 100.

2. summary:
- Give a short and clear explanation of what the code does.

3. bugs:
- Count real bugs or reasonably possible issues.
- bugs must match the number of items in bugDetails.

4. bugDetails:
For every bug provide:
- severity: Critical, High, Medium, Low, or Info
- title
- exact line number if possible, otherwise 0
- description
- suggestion

If there are no bugs:
- bugs = 0
- bugDetails = []

5. securityIssues:
- Count real security vulnerabilities.
- securityIssues must match the number of items in securityDetails.

6. securityDetails:
For every security issue provide:
- severity
- title
- exact line number if possible, otherwise 0
- description
- suggestion

If there are no security issues:
- securityIssues = 0
- securityDetails = []

7. optimizations:
- Count meaningful optimization opportunities.

8. complexity:
- Explain time complexity and space complexity.

9. recommendations:
- Give practical recommendations relevant to the submitted code.

10. optimizedCode:
- Return an improved version of the submitted code.
- Preserve the original functionality and programming language.
- If no improvement is needed, return a clean version of the original code.

11. flowchart:
- Generate a Mermaid flowchart representing the actual execution flow of the code.
- Return ONLY Mermaid syntax in this field.
- Do not use markdown code fences.
- Start with "flowchart TD".
- Keep the diagram simple and readable.
- Use meaningful node names based on the actual code.
- Avoid special characters that may break Mermaid syntax.
- If the code is simple, still create a simple flowchart.

IMPORTANT:
- Be accurate.
- Do not invent bugs.
- Do not invent security vulnerabilities.
- Make sure all counts match their detail arrays.

Code:

${code}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: Type.OBJECT,

          properties: {
            score: {
              type: Type.NUMBER,
            },

            summary: {
              type: Type.STRING,
            },

            bugs: {
              type: Type.NUMBER,
            },

            bugDetails: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  severity: {
                    type: Type.STRING,
                  },
                  title: {
                    type: Type.STRING,
                  },
                  line: {
                    type: Type.NUMBER,
                  },
                  description: {
                    type: Type.STRING,
                  },
                  suggestion: {
                    type: Type.STRING,
                  },
                },
                required: [
                  "severity",
                  "title",
                  "line",
                  "description",
                  "suggestion",
                ],
              },
            },

            securityIssues: {
              type: Type.NUMBER,
            },

            securityDetails: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  severity: {
                    type: Type.STRING,
                  },
                  title: {
                    type: Type.STRING,
                  },
                  line: {
                    type: Type.NUMBER,
                  },
                  description: {
                    type: Type.STRING,
                  },
                  suggestion: {
                    type: Type.STRING,
                  },
                },
                required: [
                  "severity",
                  "title",
                  "line",
                  "description",
                  "suggestion",
                ],
              },
            },

            optimizations: {
              type: Type.NUMBER,
            },

            complexity: {
              type: Type.STRING,
            },

            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },

            optimizedCode: {
              type: Type.STRING,
            },

            flowchart: {
              type: Type.STRING,
            },
          },

          required: [
            "score",
            "summary",
            "bugs",
            "bugDetails",
            "securityIssues",
            "securityDetails",
            "optimizations",
            "complexity",
            "recommendations",
            "optimizedCode",
            "flowchart",
          ],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Gemini API Error:", error);

    return NextResponse.json(
      { error: "Failed to analyze code" },
      { status: 500 }
    );
  }
}