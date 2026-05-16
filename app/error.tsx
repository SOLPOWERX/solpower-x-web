"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-xl font-semibold text-on-surface">Algo salió mal</h1>
        <p className="text-on-surface-variant text-sm leading-relaxed">
          La página no pudo mostrarse. Suele deberse a la base de datos (Turso) o a variables en Vercel: revisa{" "}
          <strong className="text-on-surface">DATABASE_URL</strong> o{" "}
          <strong className="text-on-surface">TURSO_DATABASE_URL</strong>, y{" "}
          <strong className="text-on-surface">TURSO_AUTH_TOKEN</strong>.
        </p>
        <p className="text-on-surface-variant text-xs">
          Abre en el navegador:{" "}
          <code className="text-primary">/api/health</code> para ver si Vercel tiene esas variables (sin mostrar secretos).
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="text-left text-xs bg-surface-container p-4 rounded-lg overflow-auto text-red-400">
            {error.message}
          </pre>
        )}
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-on-primary"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
