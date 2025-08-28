import { GoogleGenAI, Type } from "@google/genai";
import type { WordTranslation } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const translationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      arabic: {
        type: Type.STRING,
        description: 'The original Arabic word. The harakat (vowel marks) MUST be wrapped in an HTML span tag with green color, like this: <span style="color:green;">َ</span>.',
      },
      translation: {
        type: Type.STRING,
        description: 'The Indonesian translation of the word.',
      },
      pronunciation: {
        type: Type.STRING,
        description: 'The romanized transliteration of the Arabic word.',
      },
      confidence: {
        type: Type.NUMBER,
        description: 'A confidence score from 0.0 to 1.0 indicating the likelihood that the Arabic word was recognized correctly. 1.0 is highest confidence.',
      }
    },
    required: ['arabic', 'translation', 'pronunciation'],
  },
};

export async function translateWordByWord(text: string): Promise<WordTranslation[]> {
  if (!API_KEY) {
    throw new Error("API Key is not configured. Please set the API_KEY environment variable.");
  }

  const prompt = `Translate the following Arabic text into Indonesian, word by word. For each word, you MUST add the correct harakat (vowel marks). Crucially, wrap ONLY the harakat characters in a green-colored HTML span tag, like this: <span style="color:green;">َ</span>. The output must be a valid JSON array where each object has an 'arabic' key (the original word with styled harakat), a 'translation' key (the Indonesian translation), a 'pronunciation' key (the romanized transliteration), and a 'confidence' key with a value of 1.0. Preserve the original order. Do not add any explanation, introductory text, or markdown formatting, only the raw JSON array.

Arabic text: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: translationSchema,
      },
    });

    const jsonString = response.text;
    const parsedJson = JSON.parse(jsonString);
    
    if (Array.isArray(parsedJson) && parsedJson.every(item => 'arabic' in item && 'translation' in item && 'pronunciation' in item)) {
        return parsedJson as WordTranslation[];
    } else {
        throw new Error("Invalid JSON structure received from API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get translation from the AI model. Please check the console for details.");
  }
}


export async function translateImageWordByWord(imageData: string, mimeType: string): Promise<WordTranslation[]> {
  if (!API_KEY) {
    throw new Error("API Key is not configured. Please set the API_KEY environment variable.");
  }

  const prompt = `You are an advanced Optical Character Recognition (OCR) specialist and an expert Arabic-to-Indonesian translator. Your critical mission is to analyze the provided image with the utmost precision, identify every Arabic word, and provide a word-by-word translation.

**Primary Instructions:**

1.  **Maximize OCR Accuracy & Add Harakat:** Your absolute top priority is the accuracy of Arabic text recognition. For every word you identify, you MUST add the complete and correct harakat (vowel marks), even if they are not fully visible in the image. Infer the correct vocalization based on context.
2.  **Style Harakat in Green:** This is a critical formatting requirement. You MUST wrap ONLY the harakat characters (vowel marks) in a green-colored HTML span tag, for example: \`<span style="color:green;">َ</span>\`. Do not wrap the main Arabic letters.
3.  **Mandatory Confidence Score:** For every single word recognized, you MUST provide a confidence score. This score must be a numerical value between 0.0 (no confidence) and 1.0 (absolute certainty), reflecting how clear the word is in the image. This is not optional.
4.  **Provide Complete Data:** For each word, you will return its original Arabic form (with green HTML-styled harakat), its Indonesian translation, and a romanized transliteration.
5.  **Strict JSON Format:** The entire output must be a single, valid JSON array. Each object within the array must contain exactly four keys: \`arabic\`, \`translation\`, \`pronunciation\`, and \`confidence\`.
6.  **No extraneous text:** Do not include any explanatory text, introductory sentences, or markdown formatting. The response should begin with \`[\` and end with \`]\`.`;

  try {
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: mimeType,
      },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: translationSchema,
      },
    });

    const jsonString = response.text;
    const parsedJson = JSON.parse(jsonString);

    if (Array.isArray(parsedJson) && parsedJson.every(item => 'arabic' in item && 'translation' in item && 'pronunciation' in item)) {
        return parsedJson as WordTranslation[];
    } else {
        throw new Error("Invalid JSON structure received from API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API for image translation:", error);
    throw new Error("Failed to get translation from the image. The model might not have been able to read the text.");
  }
}