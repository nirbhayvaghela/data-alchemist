/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAutoCorrection.ts
import { useState } from "react";
import { toast } from "sonner";



export function useQueryThroughAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryDataWithAI = async (prompt: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/query-to-filter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      return data || [];
    } catch (err: any) {
      toast(err?.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    queryDataWithAI, // call this with `trigger(validationErrors)`
  };
}
