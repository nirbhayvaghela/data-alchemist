import { ValidationError } from "next/dist/compiled/amphtml-validator";

export function getAutoCorrectPrompt(errors: ValidationError[]) {
  return `
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
}
