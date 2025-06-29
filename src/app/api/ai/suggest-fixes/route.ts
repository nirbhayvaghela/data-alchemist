// app/api/ai/suggest-fixes.ts
import { NextResponse } from "next/server";
import { chatWithGemini } from "@/lib/ai";
import { getAutoCorrectPrompt } from "@/lib/prompts/autoCorrect";

export async function POST(req: Request) {
  const body = await req.json();

  if (!Array.isArray(body.errors)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const aiResponse = await chatWithGemini(getAutoCorrectPrompt(body.errors));
    try {
      // Remove markdown formatting if present
      const cleaned = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      // Optionally extract array if text includes surrounding text
      const jsonStart = cleaned.indexOf("[");
      const jsonEnd = cleaned.lastIndexOf("]");

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No JSON array found in response.");
      }

      const jsonString = cleaned.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonString);

      return NextResponse.json({ fixes: parsed });
    } catch (err) {
      console.error("Error parsing Gemini response:", err);
      return NextResponse.json({ fixes: [] });
    }
  } catch {
    return NextResponse.json({ error: "AI service failed" }, { status: 500 });
  }
}
