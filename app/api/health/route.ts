import { NextResponse } from "next/server";

/** Diagnóstico sin exponer secretos: útil en Vercel si la web no carga. */
export async function GET() {
  const rawDb =
    process.env.DATABASE_URL?.trim() ||
    process.env.TURSO_DATABASE_URL?.trim() ||
    "";
  const hasDbUrl = Boolean(rawDb) && rawDb !== "undefined" && rawDb !== "null";
  const hasToken = Boolean(process.env.TURSO_AUTH_TOKEN?.trim());

  return NextResponse.json({
    ok: hasDbUrl && hasToken,
    hasDatabaseUrl: hasDbUrl,
    hasTursoAuthToken: hasToken,
    hint:
      !hasDbUrl || !hasToken
        ? "En Vercel → Settings → Environment Variables añade DATABASE_URL (o TURSO_DATABASE_URL) y TURSO_AUTH_TOKEN; luego Redeploy."
        : "Variables detectadas. Si la web sigue fallando, revisa Runtime Logs del deployment.",
  });
}
