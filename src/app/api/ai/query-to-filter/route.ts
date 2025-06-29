// app/api/ai/suggest-fixes.ts
import { NextResponse } from "next/server";
import { chatWithGemini } from "@/lib/ai";
import { getQueryPrompt } from "@/lib/prompts/query";

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.prompt.trim() || typeof body.prompt !== "string") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const aiResponse = await chatWithGemini(getQueryPrompt(body.prompt));

    try {
      // Remove any markdown formatting
      const cleaned = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      // Try parsing entire response as a JSON object
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({ filters: parsed });
    } catch (err) {
      console.error("Error parsing Gemini response:", err);
      return NextResponse.json({ error: "Failed to parse AI response" });
    }
  } catch {
    return NextResponse.json({ error: "AI service failed" }, { status: 500 });
  }
}
