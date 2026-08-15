import { GoogleGenAI } from "@google/genai";
import ApiError from "../utils/ApiError.js";

let client = null;

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      503,
      "Gemini API key is not configured. Add GEMINI_API_KEY to the backend .env file.",
    );
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }

  return client;
};

const MODEL = () => {
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  console.log("GEMINI MODEL:", model);
  return model;
};

export const isAIConfigured = () => Boolean(process.env.GEMINI_API_KEY);
// Generate JSON
export const generateJson = async (prompt, responseSchema) => {
  try {
    const ai = getClient();

    const response = await ai.models.generateContent({
      model: MODEL(),
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("========== GEMINI ERROR ==========");
    console.error(error);
    console.error("==================================");

    throw new ApiError(
      502,
      error.message || "Failed to generate structured AI response.",
    );
  }
};

// Generate Text
export const generateText = async (prompt, temperature = 0.7) => {
  try {
    const ai = getClient();

    const response = await ai.models.generateContent({
      model: MODEL(),
      contents: prompt,
      config: {
        temperature,
      },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini text generation error:", error);

    throw new ApiError(502, "Failed to generate AI text.");
  }
};

// Generate Lead Summary
export const generateLeadSummary = async (lead) => {
  const prompt = `
You are a B2B sales analyst working inside a CRM.

Analyze the following lead and provide a concise executive summary.

Lead information:
Name: ${lead.name || "N/A"}
Company: ${lead.company || "N/A"}
Email: ${lead.email || "N/A"}
Pipeline Stage: ${lead.status || "N/A"}
Deal Value: ${lead.value || 0}
Source: ${lead.source || "N/A"}
Notes: ${lead.notes || "N/A"}

Provide:
- A 2 to 3 sentence executive overview
- Risk score from 0 to 100 representing the risk of losing the deal
- Suggested priority: low, medium, or high
- One concrete next best action
`;

  const responseSchema = {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "A 2 to 3 sentence executive overview of the lead.",
      },

      riskScore: {
        type: "integer",
        description: "Risk of losing the deal from 0 to 100.",
      },

      suggestedPriority: {
        type: "string",
        enum: ["low", "medium", "high"],
        description: "Suggested priority for this lead.",
      },

      nextBestAction: {
        type: "string",
        description: "One concrete recommended next step.",
      },
    },

    required: ["summary", "riskScore", "suggestedPriority", "nextBestAction"],
  };

  return generateJson(prompt, responseSchema);
};

// Generate Email
export const generateEmail = async ({
  senderName,
  senderCompany,
  purpose,
  tone,
  recipient,
}) => {
  const prompt = `
You are a senior sales representative writing an email on behalf of the authenticated CRM user.

Sender:
Name: ${senderName || "N/A"}
Company: ${senderCompany || "N/A"}

Email purpose:
${purpose || "Follow-up"}

Tone:
${tone || "friendly and professional"}

Recipient information:
Name: ${recipient?.name || "N/A"}
Company: ${recipient?.company || "N/A"}
Email: ${recipient?.email || "N/A"}
Job Title: ${recipient?.jobTitle || "N/A"}
Notes: ${recipient?.notes || "N/A"}

Write a concise but complete sales email.

The email body must:
- Use appropriate line breaks
- Be under 180 words
- Match the requested tone
- Clearly serve the requested purpose
`;

  const responseSchema = {
    type: "object",
    properties: {
      subject: {
        type: "string",
        description: "Email subject line.",
      },

      body: {
        type: "string",
        description:
          "Email body with appropriate line breaks and under 180 words.",
      },
    },

    required: ["subject", "body"],
  };

  return generateJson(prompt, responseSchema);
};

// Generate Sales Insights
export const generateSalesInsights = async (pipelineStats) => {
  const prompt = `
You are a revenue operations adviser.

Analyze the following CRM pipeline statistics and provide actionable sales insights.

Pipeline statistics:

${JSON.stringify(pipelineStats, null, 2)}

Base your analysis only on the actual numbers provided above.

Provide:
- A one-sentence pipeline health summary
- 3 to 5 data-driven observations
- 3 to 5 prioritized recommendations
- A health score from 0 to 100
`;

  const responseSchema = {
    type: "object",
    properties: {
      headline: {
        type: "string",
        description: "A one-sentence summary of pipeline health.",
      },

      insights: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: {
          type: "string",
        },
        description: "3 to 5 data-driven observations.",
      },

      recommendations: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: {
          type: "string",
        },
        description: "3 to 5 prioritized actions.",
      },

      healthScore: {
        type: "integer",
        description: "Pipeline health score from 0 to 100.",
      },
    },

    required: ["headline", "insights", "recommendations", "healthScore"],
  };

  return generateJson(prompt, responseSchema);
};
