/* eslint-disable @typescript-eslint/no-explicit-any */

// lib/ai.ts
export async function getFixSuggestionsFromGemini(errors: any[]) {
  const prompt = `
      You are an AI data cleaner. You will receive:
      - A list of validation errors, each with row number, column name, and type

      There are 3 tables: **clients**, **workers**, and **tasks**.

      Use the column name and your understanding of the following table schemas to determine:
      - Which table the fix belongs to
      - The corrected value

      ✅ Add a \`table\` field to your response, inferred from column name

      ---

      **clients.csv**
      ClientID, ClientName, PriorityLevel, RequestedTaskIDs, GroupTag, AttributesJSON

      **workers.csv**
      WorkerID, WorkerName, Skills, AvailableSlots, MaxLoadPerPhase, WorkerGroup, QualificationLevel

      **tasks.csv**
      TaskID, TaskName, Category, Duration, RequiredSkills, PreferredPhases, MaxConcurrent

      ---

      Only suggest fixes for errors with type: 'invalid', 'format', 'out-of-range', or 'missing'.  
      Return an array like:

      [
        {
          "table": "workers",
          "row": 4,
          "column": "AvailableSlots",
          "value": [1, 2, 3],
          "reason": "Trailing comma removed; likely meant to include phase 2"
        }
      ]

      Validation errors:
      ${JSON.stringify(errors, null, 2)}
      `;

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
  console.log("Gemini raw content:\n", content);

  try {
    // Remove markdown formatting if present
    const cleaned = content
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

    return parsed;
  } catch (err) {
    console.error("Error parsing Gemini response:", err);
    return [];
  }
}
