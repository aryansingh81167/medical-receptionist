"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6 font-body-md">
      <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-[2rem] card-shadow border border-outline-variant/30 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-3xl">warning</span>
        </div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">Something went wrong!</h2>
        <p className="text-on-surface-variant mb-8 leading-relaxed">
          We experienced an unexpected issue connecting to the CareFlow network. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 bg-primary text-white py-3 px-6 rounded-xl font-bold hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="flex-1 bg-surface-container-high text-on-surface py-3 px-6 rounded-xl font-bold hover:bg-surface-container-highest transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
