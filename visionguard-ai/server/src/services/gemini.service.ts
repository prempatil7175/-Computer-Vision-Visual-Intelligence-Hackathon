import { GoogleGenAI, Type } from '@google/genai';
import { env } from '../config/env';

// Initialize the Gemini SDK. Ensure GEMINI_API_KEY is in your environment variables.
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    anomalies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "e.g., PPE_Violation, Concrete_Crack, Corrosion" },
          severity: { type: Type.STRING, description: "Must be 'Low', 'Moderate', or 'Critical'" },
          description: { type: Type.STRING, description: "Detailed visual description of the anomaly" },
          recommended_action: { type: Type.STRING, description: "Immediate remediation step" },
          estimated_repair_urgency: { type: Type.STRING },
          bounding_box: {
             type: Type.OBJECT,
             properties: {
                x: { type: Type.NUMBER }, y: { type: Type.NUMBER }
             }
          }
        },
        required: ["category", "severity", "description", "recommended_action"]
      }
    },
    overall_site_safety_score: { type: Type.NUMBER, description: "1-100 score" }
  },
  required: ["anomalies", "overall_site_safety_score"]
};

export async function analyzeImage(imageBase64: string, inspectionType: string) {
  const prompt = `You are VisionGuard-AI, an expert computer vision diagnostic system for civil infrastructure and construction safety. 
Your purpose is to analyze visual data from construction sites, bridges, and high-rises. You must meticulously scan images for structural degradation (cracks, rust, spalling) and safety protocol violations (missing helmets, vests, harnesses). 
You are objective, highly accurate, and adhere strictly to outputting valid, structured JSON containing the specific coordinates and severity of identified issues.

Analyze the provided infrastructure image. The inspection type is: ${inspectionType}.
Identify all structural defects and safety compliance issues. Classify their severity based on standard engineering and OSHA safety guidelines. 
Return the results EXCLUSIVELY matching the provided JSON schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.2, // Low temperature for more deterministic analysis
    },
  });

  return JSON.parse(response.text || '{}');
}
