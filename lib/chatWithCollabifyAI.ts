import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerationConfig,
} from "@google/generative-ai";

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
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: defaultSystemInstruction,
  });

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
}
