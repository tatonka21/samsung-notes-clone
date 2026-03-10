import { GoogleGenerativeAI } from "@google/generative-ai";

export const MODEL_NAME = "gemini-2.0-flash";

export function getGeminiClient(apiKey: string) {
  return new GoogleGenerativeAI(apiKey);
}

export async function sendChatMessage(
  apiKey: string,
  history: { role: "user" | "model"; parts: string }[],
  message: string
): Promise<string> {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const chat = model.startChat({
    history: history.map((h) => ({
      role: h.role,
      parts: [{ text: h.parts }],
    })),
    generationConfig: { maxOutputTokens: 8192 },
  });
  const result = await chat.sendMessage(message);
  return result.response.text();
}

export async function generateText(
  apiKey: string,
  prompt: string
): Promise<string> {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function enhanceNote(
  apiKey: string,
  action: "summarize" | "expand" | "rewrite" | "bullets",
  content: string
): Promise<string> {
  const prompts: Record<string, string> = {
    summarize: `Summarize the following note concisely:\n\n${content}`,
    expand: `Expand the following note with more detail and context:\n\n${content}`,
    rewrite: `Rewrite the following note to be clearer and better organized:\n\n${content}`,
    bullets: `Convert the following note into a well-organized bullet point list:\n\n${content}`,
  };
  return generateText(apiKey, prompts[action]);
}
