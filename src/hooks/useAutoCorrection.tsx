/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAutoCorrection.ts
import { useState } from "react";
import { toast } from "sonner";

interface ValidationError {
  row: number;
  column: string;
  type: string;
  message: string;
  severity?: string;
}


export function useAutoCorrection() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoCorrect = async (validationErrors: ValidationError[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/suggest-fixes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ errors: validationErrors }),
      });

      const data = await res.json();

      if (!res.ok || !data.fixes) {
        toast("AI response missing or malformed");
      }

      return data.fixes || [];
    } catch (err: any) {
      console.error("Auto-correction failed:", err);
      toast(err?.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    autoCorrect, // call this with `trigger(validationErrors)`
  };
}
