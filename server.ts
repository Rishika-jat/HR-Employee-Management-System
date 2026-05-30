import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY element is missing. Express server will run but AI features will fail.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY_FOR_BUILD",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route: AI HR Assistant Chat
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, previousMessages, systemContext } = req.body;
      const ai = getGeminiClient();

      // Formulate a structured chat prompt adding context to enforce roleplay as an elite Chief Human Resources Officer
      const contextPrompt = `You are "Nellie", an elite HR Director & Virtual CHRO Assistant for a small/medium business. 
Your tone is professional, legally-conscious, highly supportive, and objective. 
You are speaking to company managers or HR staff.

Current System State/Info:
${JSON.stringify(systemContext || {})}

Previous Chat History:
${(previousMessages || []).map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join("\n")}

Respond to this inquiry:
User: ${message}

Provide clear, helpful, standard Compliant HR responses. Use Markdown list formats where applicable. Keep the answer highly practical, specific to employment advice, and concise.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contextPrompt,
        config: {
          temperature: 0.7,
        }
      });

      res.json({ text: response.text || "No response received from the model." });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: error?.message || "An error occurred with Gemini API." });
    }
  });

  // API Route: Generate Custom HR Policy Document
  app.post("/api/ai/generate-policy", async (req, res) => {
    try {
      const { topic, audience, strictness } = req.body;
      const ai = getGeminiClient();

      const prompt = `Draft a professional, legally-compliant HR Policy Document.
Topic/Title: ${topic}
Target Audience: ${audience || "All Employees"}
Strictness/Vibe: ${strictness || "Balanced and professional"}

Please structure the document using Standard Corporate Layout:
1. Title
2. Policy ID & Effective Date (mock dates based inside 2026)
3. Purpose & Objective
4. Scope of Coverage
5. Core Guidelines & Code of Conduct
6. Exceptions or Grace Periods
7. Disciplinary Actions or Consequences
8. Document Approvers & Contact

Write in clear Standard Markdown formatting.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.8,
        }
      });

      res.json({ text: response.text || "Failed to generate policy." });
    } catch (error: any) {
      console.error("AI Generation Policy Error:", error);
      res.status(500).json({ error: error?.message || "Internal server error." });
    }
  });

  // API Route: Sketch Offer Letter Draft
  app.post("/api/ai/generate-offer", async (req, res) => {
    try {
      const { candidateName, roleName, department, baseSalary, joiningDate, benefitsSummary } = req.body;
      const ai = getGeminiClient();

      const prompt = `Draft a warm, official HR employment offer letter.
Candidate: ${candidateName}
Role: ${roleName}
Department: ${department}
Annual Base Salary: $${baseSalary?.toLocaleString() || "Market Standards"}
Expected Start Date: ${joiningDate}
Key Benefits: ${benefitsSummary || "Standard Corporate Package (Premium Healthcare, Paid Time Off, Retirement Plans)"}

Include standard components:
- Warm greeting and congratulations
- Title of position, supervisor, core work mode (Hybrid/Remote)
- Compensation details and frequency of payments
- Summary of benefits
- Notice period / At-Will explanation
- Acceptance deadline (set to 7 days from today)
- Signature block for the CEO / HR Team

Format beautifully with Markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      res.json({ text: response.text || "Failed to generate offer letter." });
    } catch (error: any) {
      console.error("AI Offer Gen Error:", error);
      res.status(500).json({ error: error?.message || "Internal server error." });
    }
  });

  // API Route: Document Analyzer & Summarizer
  app.post("/api/ai/analyze-document", async (req, res) => {
    try {
      const { docTitle, docContentSnippet } = req.body;
      const ai = getGeminiClient();

      const prompt = `Review the following document and provide an HR Security and Compliance Summary.
Document Title: ${docTitle}
Content/Extract:
"""
${docContentSnippet}
"""

Please return standard JSON-compatible Markdown structure:
- **Brief Overview**: 1-2 sentences summarizing the file contents.
- **Key Obligations/Clauses**: List bullet points highlighting critical expectations, constraints, or obligations.
- **Potential HR Risks/Compliance Concerns**: Note any areas requiring closer HR supervision (e.g. restrictive termination, loose workplace guidelines, IP gaps).
- **Recommended Action Items**: 2-3 step actionable list for HR staff to process this document.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.2, // low temperature for precise legal snippet analysis
        }
      });

      res.json({ text: response.text || "No analysis generated." });
    } catch (error: any) {
      console.error("AI analysis document Error:", error);
      res.status(500).json({ error: error?.message || "Internal server error." });
    }
  });

  // Vite Integration for HMR and Assets
  if (process.env.NODE_ENV !== "production") {
    console.log("Injecting Vite middleware for development.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`Production build configuration active. Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind exclusively to 0.0.0.0 and Port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HR Express application started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
