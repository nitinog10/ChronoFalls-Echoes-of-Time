
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GameState, LocationId } from "../types"; // Assuming types.ts is in the parent directory

// Ensure API_KEY is accessed correctly. In a real build process,
// this would be replaced by the build tool (e.g., Vite, Webpack).
// For this environment, we rely on it being globally available or shimmed.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "DISABLED" });
const modelName = 'gemini-2.5-flash-preview-04-17'; // Correct model for text

export const askEchoAI = async (
  question: string,
  currentLocation: LocationId,
  gameState: GameState
): Promise<string> => {
  if (!API_KEY) {
    return "Echo seems to be silent. The connection to the temporal currents is weak. (API Key not configured)";
  }

  const gameStateSummary = Object.entries(gameState)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  const prompt = `
You are Echo, a sentient AI artifact guiding a Traveler through time at the ChronoFalls.
The Traveler is currently at location: ${currentLocation}.
Their current game state is: ${gameStateSummary}.
The Traveler asks: "${question}"

Provide a concise, insightful, and slightly enigmatic response in character as Echo.
Keep responses to 2-3 sentences.
Do not repeat the question or the context in your answer.
Focus on providing a hint, lore, or a thought-provoking comment related to their question and current situation.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: "You are Echo, a sentient AI artifact guiding a traveler through time. You are wise, slightly enigmatic, and helpful. Your responses should be concise and relevant to the traveler's situation or question. You are aware of the ChronoFalls and the vanished civilization.",
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        // thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster, potentially less nuanced responses. For more thoughtful, omit.
      }
    });
    
    let text = response.text.trim();
    // Gemini might wrap JSON in ```json ... ```, but for text, it's usually direct.
    // However, sometimes it might add markdown-like quotes or other formatting.
    // This is a simple cleanup, more robust parsing might be needed for complex cases.
    text = text.replace(/^```(text|plaintext)?\s*|\s*```$/g, "").trim();

    return text || "Echo's voice fades into the temporal winds... (No response text)";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    let errorMessage = "Echo struggles to pierce the veil of time... (API Error)";
    if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
    }
    return errorMessage;
  }
};
    