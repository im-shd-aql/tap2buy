"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-warm-white px-4 text-center">
      <h1 className="text-6xl font-extrabold text-primary">Oops</h1>
      <p className="mt-4 text-xl font-semibold text-dark">
        Something went wrong
      </p>
      <p className="mt-2 text-muted">
        We&apos;re sorry, an unexpected error occurred.
      </p>
      <button
        onClick={reset}
        className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-lg"
      >
        Try Again
      </button>
    </div>
  );
}
