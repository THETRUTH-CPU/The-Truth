import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up body parsing with high limits to accommodate room image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to get Gemini Client lazily and handle missing keys gracefully
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API for room decluttering and organization analysis
app.post("/api/organize", async (req, res) => {
  try {
    const { image, roomType, goals, painPoints, clutterFocus } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No room image provided." });
    }

    // Parse the data URL (e.g. "data:image/jpeg;base64,....")
    let mimeType = "image/jpeg";
    let base64Data = image;

    if (image.startsWith("data:")) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    // Initialize Gemini Client
    const ai = getGeminiClient();

    // Construct a comprehensive and helpful prompt
    const prompt = `
Analyze this photo of a room and provide professional, encouraging, and highly actionable suggestions for decluttering, organizing, and spatial zoning.

Current Context:
- Target Room Type: ${roomType === "any" ? "Auto-detect from image" : roomType}
- Organization Goals: ${goals || "Maximize space, neatness, and peaceful ambiance"}
- Current Pain Points: ${painPoints || "General clutter and organization flow issues"}
- Clutter Inspection Focus: ${clutterFocus || "detailed"}

Please return the response as a structured JSON object according to the requested schema. Ensure that your advice is tailored to the objects visible in the image, providing specific decluttering steps, layout ideas, storage solutions, and visual tips.
`;

    // Make the API call to gemini-3.5-flash with structured JSON response
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roomType: {
              type: Type.STRING,
              description: "Short standardized room string like: living_room, bedroom, kitchen, bathroom, office, closet, entryway, laundry, dining_room, playroom, garage, other."
            },
            roomTypeDisplay: {
              type: Type.STRING,
              description: "Beautiful clean display name, e.g., 'Messy Living Room', 'Home Office Space', 'Kitchen Countertops'."
            },
            clutterScore: {
              type: Type.INTEGER,
              description: "Score from 1 to 10 (1 is immaculate, 10 is extremely cluttered) analyzing visual density, unsorted items, and system issues."
            },
            roomAnalysis: {
              type: Type.STRING,
              description: "An encouraging, insightful, and detailed paragraphs summarizing what exists in the room, what is working, and why the clutter accumulates."
            },
            clutterSources: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of the 2-5 specific main visual clutter culprits identified in this specific room."
            },
            declutterSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  phase: { type: Type.STRING, description: "The phase or order, e.g., 'Phase 1: Clear Space', 'Phase 2: Group Category', 'Phase 3: Clean', 'Phase 4: Style'" },
                  title: { type: Type.STRING, description: "Short, clear action step title." },
                  description: { type: Type.STRING, description: "Specific detailed description on what and how to do it based on this photo." }
                },
                required: ["id", "phase", "title", "description"]
              },
              description: "Actionable 4-7 step guide for the user to completely organize this space."
            },
            layoutSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  area: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                },
                required: ["area", "suggestion"]
              },
              description: "1-3 structural or furniture rearranging layout ideas to open up space."
            },
            storageSolutions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING, description: "Recommended physical storage item, e.g., pegboard, clear bins, cable management sleeve, hanging shoe rack." },
                  purpose: { type: Type.STRING, description: "What items of theirs this specific container resolves." },
                  estimatedCost: { type: Type.STRING, description: "Must be 'Low', 'Medium', or 'High'." }
                },
                required: ["item", "purpose", "estimatedCost"]
              },
              description: "2-4 smart physical shelving/bins/organizing options."
            },
            aestheticTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 interior styling and visual peace rules (color theory, grouping, ambient light, adding plants) matching their space."
            }
          },
          required: [
            "roomType",
            "roomTypeDisplay",
            "clutterScore",
            "roomAnalysis",
            "clutterSources",
            "declutterSteps",
            "layoutSuggestions",
            "storageSolutions",
            "aestheticTips"
          ]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No suggestion text was generated by Gemini.");
    }

    const data = JSON.parse(responseText.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Gemini room analysis error:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred during room analysis.",
    });
  }
});

// Implement Vite server integration for full-stack functionality
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server bound and running on http://localhost:${PORT}`);
  });
}

startServer();
