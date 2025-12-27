import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerationConfig,
} from "@google/generative-ai";

type GeminiModelListResponse = {
  models?: Array<{
    name?: string;
    supportedGenerationMethods?: string[];
  }>;
};

const FALLBACK_GEMINI_MODELS = ["gemini-2.5-flash"];
const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedGeminiModels: { models: string[]; fetchedAt: number } | null = null;
let modelRotationIndex = 0;

const isEligibleGeminiModel = (model: {
  name?: string;
  supportedGenerationMethods?: string[];
}): boolean => {
  const name = model.name ?? "";
  if (!name.startsWith("models/gemini-")) {
    return false;
  }

  const loweredName = name.toLowerCase();
  if (loweredName.includes("embedding") || loweredName.includes("pro")) {
    return false;
  }

  const methods = model.supportedGenerationMethods ?? [];
  return methods.length === 0 || methods.includes("generateContent");
};

const normalizeModelName = (name: string): string =>
  name.replace(/^models\//, "");

const dedupeModels = (models: string[]): string[] => {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const model of models) {
    if (!seen.has(model)) {
      seen.add(model);
      unique.push(model);
    }
  }
  return unique;
};

const getRotatedModels = (models: string[]): string[] => {
  if (models.length === 0) {
    return models;
  }
  const startIndex = modelRotationIndex % models.length;
  modelRotationIndex = (modelRotationIndex + 1) % models.length;
  return [...models.slice(startIndex), ...models.slice(0, startIndex)];
};

const fetchGeminiModels = async (apiKey: string): Promise<string[]> => {
  if (
    cachedGeminiModels &&
    Date.now() - cachedGeminiModels.fetchedAt < MODEL_CACHE_TTL_MS
  ) {
    return cachedGeminiModels.models;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(
      apiKey,
    )}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Gemini models: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as GeminiModelListResponse;
  const models = (data.models ?? [])
    .filter(isEligibleGeminiModel)
    .map((model) => normalizeModelName(model.name ?? ""))
    .filter(Boolean);

  const uniqueModels = dedupeModels(models);
  if (uniqueModels.length === 0) {
    throw new Error("No eligible Gemini models found.");
  }

  cachedGeminiModels = { models: uniqueModels, fetchedAt: Date.now() };
  return uniqueModels;
};

/**
 * Sends a chat message to Gemini AI. This helper preserves conversation history so that the context
 * is maintained between messages. The assistant is identified as "Collabify Assistant" and acts as a
 * knowledgeable project management expert.
 *
 * @param history - An array representing the conversation history. Each element should have a `role` and `parts`.
 * @param message - The latest user message to send.
 * @param systemInstruction - (Optional) A custom system instruction to override the default.
 * @returns A promise that resolves to the AI's response text.
 */
export async function chatWithCollabifyAI(
  history: Array<{ role: string; parts: Array<{ text: string }> }>,
  message: string,
  systemInstruction = "",
  userContext?: string,
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_AI_API_KEY in environment variables");
  }

  const defaultSystemInstruction =
    systemInstruction ||
    `
    You are Collabify Assistant, a project management expert.
    Answer user questions about projects, collaboration, and productivity with clarity, precision, and empathy.
    Provide detailed advice based on project management best practices.
    
    Here is some context you can reference:
    ${userContext ?? "No additional context."}

    This conversation is between a user and you, the assistant. Remain professional, approachable, and solution‑focused.
    Also, the conversation may be in either Vietnamese or English, so please respond in the same language as the user.
  `;

  const genAI = new GoogleGenerativeAI(apiKey);

  const generationConfig: GenerationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  history.push({ role: "user", parts: [{ text: message }] });

  let modelNames = FALLBACK_GEMINI_MODELS;
  try {
    modelNames = await fetchGeminiModels(apiKey);
  } catch {
    modelNames = FALLBACK_GEMINI_MODELS;
  }

  const rotatedModels = getRotatedModels(modelNames);
  let lastError: unknown = null;

  for (const modelName of rotatedModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: defaultSystemInstruction,
      });

      const chatSession = model.startChat({
        generationConfig,
        safetySettings,
        history,
      });

      const result = await chatSession.sendMessage(message);

      if (!result.response || !result.response.text) {
        throw new Error("Failed to get text response from the AI.");
      }

      return result.response.text();
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error("Failed to get text response from the AI.");
}
