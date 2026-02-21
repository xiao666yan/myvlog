
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Directly use process.env.API_KEY for initialization as per guidelines and instantiate inside the function
export const summarizeArticle = async (content: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Please summarize the following blog post content into a concise paragraph (max 150 words): \n\n ${content}`,
      config: {
        temperature: 0.7,
      },
    });
    // Fix: Access response.text as a property, not a method
    return response.text || "Summary generation failed.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Failed to connect to AI service.";
  }
};

// Fix: Directly use process.env.API_KEY for initialization as per guidelines and instantiate inside the function
export const suggestTags = async (title: string, content: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on the title "${title}" and content "${content}", suggest 5 relevant technical tags as a comma-separated list.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      },
    });
    // Fix: Access response.text as a property, not a method
    const result = JSON.parse(response.text || '{"tags": []}');
    return result.tags;
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
};
