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

  const prompt = `Translate the following Arabic text into Indonesian, word by word, with high contextual accuracy for connecting words.

**Key Instructions:**
1.  **Harakat Formatting:** For each word, you MUST add the correct harakat (vowel marks). Crucially, wrap ONLY the harakat characters in a green-colored HTML span tag, like this: \`<span style="color:green;">َ</span>\`.
2.  **Contextual Connectors:** Pay special attention to common connecting words (prepositions, conjunctions, particles). Translate them contextually to ensure the Indonesian phrasing is natural and grammatically correct. For example, \`هُوَ\` can be 'ia (adalah)', \`إِلَى\` should be 'kepada', the words in \`وَمَا كَانَتْ\` should be translated to form 'Dan tidaklah', and \`إِلَّا\` as 'melainkan'. Choose the best Indonesian equivalent based on the surrounding words.
3.  **JSON Output:** The output must be a valid JSON array where each object represents one Arabic word and has keys for 'arabic' (with styled harakat), 'translation', 'pronunciation', and a 'confidence' of 1.0.
4.  **Preserve Order:** The order of words in the output array must match the original text.
5.  **Clean JSON:** Do not add any explanation, introductory text, or markdown formatting. The response must be only the raw JSON array.

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

  const prompt = `You are a highly specialized AI model with a dual function: state-of-the-art Optical Character Recognition (OCR) for Arabic script and expert-level Arabic-to-Indonesian contextual translation. Your task is to process the following image with maximum precision.

**CRITICAL DIRECTIVES - Adherence is Mandatory:**

1.  **OCR ACCURACY IS PARAMOUNT:** Your primary objective is to recognize the Arabic text with the highest possible accuracy. Carefully analyze the script, including subtle marks.

2.  **MANDATORY HARAKAT & HTML COLORING:**
    *   For EVERY Arabic word you recognize, you MUST add the full, contextually correct harakat (vowel marks).
    *   This is a NON-NEGOTIABLE formatting rule: You MUST wrap EACH harakat character individually in an HTML span tag styled with green color. Example: \`ك<span style="color:green;">َ</span>ت<span style="color:green;">َ</span>ب<span style="color:green;">َ</span>\`. Do NOT wrap the entire word or multiple harakat in a single span.

3.  **MANDATORY CONFIDENCE SCORE:**
    *   For EVERY single word, you MUST provide a \`confidence\` score.
    *   This score must be a numerical value from 0.0 to 1.0, representing your certainty of the OCR accuracy for that specific word. 1.0 means perfect certainty. This is an ABSOLUTE REQUIREMENT.

4.  **CONTEXTUAL TRANSLATION:**
    *   Provide a precise, word-by-word Indonesian translation.
    *   Pay special attention to connecting words (e.g., هُوَ, إِلَى, وَمَا كَانَتْ). Translate them naturally based on the surrounding text, not in a rigid, literal way. For example, \`هُوَ\` could be 'ia (adalah)', and \`إِلَّا\` could be 'melainkan'.

**OUTPUT FORMAT - STRICTLY JSON:**
You must return ONLY a valid JSON array. Each object in the array represents a single word and must contain exactly four keys: \`arabic\`, \`translation\`, \`pronunciation\` (romanized transliteration), and \`confidence\`.

**Example of a single object in the array:**
\`\`\`json
{
  "arabic": "ٱلْح<span style=\\"color:green;\\">َ</span>م<span style=\\"color:green;\\">ْ</span>د<span style=\\"color:green;\\">ُ</span>",
  "translation": "segala puji",
  "pronunciation": "al-ḥamdu",
  "confidence": 0.98
}
\`\`\`

Do not add any text, explanations, or markdown formatting outside of the JSON array. The response must start with \`[\` and end with \`]\`.`;

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