// app/api/ai/suggest-fixes.ts
import { NextResponse } from "next/server";
import { getFixSuggestionsFromGemini } from "@/lib/ai";

export async function POST(req: Request) {
  const body = await req.json();

  if (!Array.isArray(body.errors)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const fixes = await getFixSuggestionsFromGemini(body.errors);
    return NextResponse.json({ fixes });
  } catch {
    return NextResponse.json({ error: "AI service failed" }, { status: 500 });
  }
}
