"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] font-display mb-3">
          Something went wrong
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={() => reset()}
          className="bg-teal text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-teal/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
