import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResponse, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    stressLevel: {
      type: Type.NUMBER,
      description: "Estimated stress level from 0 (very low) to 10 (extreme panic).",
    },
    mood: {
      type: Type.STRING,
      description: "A one or two word description of the user's current mood.",
    },
    energyLevel: {
      type: Type.NUMBER,
      description: "Estimated energy level from 0 (lethargic) to 10 (hyperactive).",
    },
    summary: {
      type: Type.STRING,
      description: "A compassionate, professional summary of the observations.",
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 actionable, short coping mechanisms or activities.",
    },
    prediction: {
      type: Type.STRING,
      description: "A probability statement about stress reduction based on habits (e.g. 'Your exercise habit increases the probability of stress reduction by 30% today').",
    }
  },
  required: ["stressLevel", "mood", "energyLevel", "summary", "recommendations", "prediction"],
};

const LANGUAGE_MAP: Record<Language, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  hi: "Hindi",
  zh: "Mandarin Chinese"
};

export const geminiService = {
  /**
   * Analyzes a multimodal check-in
   */
  analyzeCheckIn: async (
    textInput: string,
    imageBase64: string | null,
    audioBase64: string | null,
    language: Language,
    completedHabits: string[]
  ): Promise<AnalysisResponse> => {
    try {
      const parts: any[] = [];
      const langName = LANGUAGE_MAP[language];

      // Add System Context
      const systemContext = `
        You are an expert AI mental health assistant named Calmify.
        Language: Please respond in ${langName}.
        
        Analyze the inputs (text, face, voice) and the user's completed habits for today: [${completedHabits.join(', ')}].
        
        Task:
        1. Assess mental state.
        2. Calculate a hypothetical probability of stress reduction based on their completed habits (e.g., if they meditated, probability of calm increases).
        3. Rate Stress/Energy (0-10).
        4. Be empathetic.
      `;
      
      parts.push({ text: systemContext });

      if (textInput) {
        parts.push({ text: `User Note: "${textInput}"` });
      }

      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64,
          },
        });
      }

      if (audioBase64) {
        parts.push({
          inlineData: {
            mimeType: "audio/wav", 
            data: audioBase64,
          },
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: ANALYSIS_SCHEMA,
          systemInstruction: `You are a empathetic mental health professional speaking ${langName}.`,
        },
      });

      if (!response.text) {
        throw new Error("No response from AI");
      }

      return JSON.parse(response.text) as AnalysisResponse;

    } catch (error) {
      console.error("Analysis failed:", error);
      throw error;
    }
  },

  /**
   * Chat functionality
   */
  createChatSession: (language: Language) => {
    const langName = LANGUAGE_MAP[language];
    return ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `
          You are Calmify, a compassionate AI mental health companion.
          Please converse in ${langName}.
          Your goal is to listen, validate feelings, and offer gentle guidance.
          Keep responses concise.
          Do not diagnose.
          If self-harm is mentioned, provide emergency resources immediately.
        `,
      },
    });
  }
};
