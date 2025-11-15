'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Something went wrong!</h2>
        <p className="text-foreground-secondary mb-4">{error.message}</p>
      </div>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition"
      >
        Try again
      </button>
    </div>
  );
}
