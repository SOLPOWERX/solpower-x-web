"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-8 font-sans antialiased">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-xl font-semibold">Algo salió mal</h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Comprueba en Vercel las variables{" "}
            <strong className="text-neutral-200">DATABASE_URL</strong> (o{" "}
            <strong className="text-neutral-200">TURSO_DATABASE_URL</strong>) y{" "}
            <strong className="text-neutral-200">TURSO_AUTH_TOKEN</strong>. Luego haz Redeploy.
          </p>
          <p className="text-neutral-500 text-xs">
            Diagnóstico: <code className="text-amber-400">/api/health</code>
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="text-left text-xs bg-neutral-900 p-4 rounded-lg overflow-auto text-red-400">{error.message}</pre>
          )}
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-amber-500 px-6 py-3 text-sm font-medium text-neutral-950"
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
