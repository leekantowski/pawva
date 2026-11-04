"use client";

import { useOptimistic, useState, useTransition } from "react";
import { setStar } from "@/app/walks/star-actions";

/** ☆/★ toggle. Flips instantly (optimistic), then the server confirms or it flips back. */
export default function StarButton({ walkId, starred, size = "md" }: { walkId: number; starred: boolean; size?: "md" | "lg" }) {
  const [optimistic, setOptimistic] = useOptimistic(starred);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    const next = !optimistic;
    setError(null);
    startTransition(async () => {
      setOptimistic(next);
      const result = await setStar(walkId, next);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <span className="star-wrap">
      <button
        type="button"
        onClick={toggle}
        className={`star-btn star-${size}${optimistic ? " is-starred" : ""}`}
        aria-pressed={optimistic}
        aria-label={optimistic ? "Unstar this walk" : "Star this walk"}
        title={optimistic ? "Unstar" : "Star"}
      >
        {optimistic ? "★" : "☆"}
      </button>
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
