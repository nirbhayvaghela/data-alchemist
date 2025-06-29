/* eslint-disable @typescript-eslint/no-explicit-any */

// lib/ai.ts
export async function chatWithGemini(prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return content || "";
  // console.log("Gemini raw content:\n", content);

  // try {
  //   // Remove markdown formatting if present
  //   const cleaned = content
  //     .replace(/```json/g, "")
  //     .replace(/```/g, "")
  //     .trim();

  //   // Optionally extract array if text includes surrounding text
  //   const jsonStart = cleaned.indexOf("[");
  //   const jsonEnd = cleaned.lastIndexOf("]");

  //   if (jsonStart === -1 || jsonEnd === -1) {
  //     throw new Error("No JSON array found in response.");
  //   }

  //   const jsonString = cleaned.slice(jsonStart, jsonEnd + 1);
  //   const parsed = JSON.parse(jsonString);

  //   return parsed;
  // } catch (err) {
  //   console.error("Error parsing Gemini response:", err);
  //   return [];
  // }
}
