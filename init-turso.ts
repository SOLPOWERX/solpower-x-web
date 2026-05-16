
import { createClient } from "@libsql/client";
import "dotenv/config";

const isInvalidTursoUrl = (value: string | undefined) => {
  const trimmed = value?.trim()
  if (!trimmed) return true
  if (trimmed === "undefined" || trimmed === "null") return true
  if (trimmed.includes("your-db-name") || trimmed.includes("your-auth-token")) return true
  return false
}

async function init() {
  const url = !isInvalidTursoUrl(process.env.DATABASE_URL)
    ? process.env.DATABASE_URL!.trim()
    : !isInvalidTursoUrl(process.env.TURSO_DATABASE_URL)
    ? process.env.TURSO_DATABASE_URL!.trim()
    : undefined
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim()

  if (!url) {
    console.error("Error: DATABASE_URL o TURSO_DATABASE_URL no encontrada o inválida en el archivo .env");
    process.exit(1);
  }

  console.log("Conectando a Turso...");
  const client = createClient({
    url: url.startsWith("libsql://") ? url.replace("libsql://", "https://") : url,
    authToken: authToken,
  });

  const queries = [
    `CREATE TABLE IF NOT EXISTS "AdminUser" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "username" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_username_key" ON "AdminUser"("username");`,
    
    `CREATE TABLE IF NOT EXISTS "SectionState" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'hidden',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "SectionState_name_key" ON "SectionState"("name");`,

    `CREATE TABLE IF NOT EXISTS "Statistic" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "subtext" TEXT NOT NULL,
      "visible" BOOLEAN NOT NULL DEFAULT true,
      "displayOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Statistic_name_key" ON "Statistic"("name");`,

    `CREATE TABLE IF NOT EXISTS "Lead" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "interest" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS "Project" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "partnerCompany" TEXT NOT NULL,
      "powerKwp" REAL NOT NULL,
      "projectType" TEXT NOT NULL,
      "location" TEXT NOT NULL,
      "impact" TEXT NOT NULL,
      "imageUrl" TEXT NOT NULL,
      "technicalSpecs" TEXT NOT NULL,
      "visible" BOOLEAN NOT NULL DEFAULT true,
      "displayOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Project_name_key" ON "Project"("name");`
  ];

  console.log("Creando tablas en la nube...");
  for (const query of queries) {
    try {
      await client.execute(query);
    } catch (e) {
      console.error("Error ejecutando query:", query);
      console.error(e);
    }
  }

  console.log("¡Todo listo! Las tablas han sido creadas en Turso.");
  console.log("Ahora puedes refrescar tu página de Vercel.");
}

init().catch(console.error);
