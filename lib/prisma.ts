import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient
  prismaInitialization?: Promise<PrismaClient>
}

const isInvalidEnvUrl = (value: string | undefined) => {
  const trimmed = value?.trim()
  if (!trimmed) return true
  if (trimmed === "undefined" || trimmed === "null") return true
  if (trimmed.includes("your-db-name") || trimmed.includes("your-auth-token")) return true
  return false
}

/** Turso URLs often use libsql://; @libsql/client expects https for remote. */
function normalizeLibSqlUrl(raw: string) {
  const u = raw.trim()
  return u.startsWith("libsql://") ? `https://${u.slice("libsql://".length)}` : u
}

function resolveDatabaseUrl(): string | undefined {
  if (!isInvalidEnvUrl(process.env.DATABASE_URL)) {
    return process.env.DATABASE_URL!.trim()
  }
  if (!isInvalidEnvUrl(process.env.TURSO_DATABASE_URL)) {
    return process.env.TURSO_DATABASE_URL!.trim()
  }
  return undefined
}

async function createPrismaClient(): Promise<PrismaClient> {
  const rawUrl = resolveDatabaseUrl()
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim()

  if (process.env.NODE_ENV !== "production") {
    console.log("PRISMA ENV CHECK", {
      databaseUrl: process.env.DATABASE_URL ? "set" : "missing",
      tursoDatabaseUrl: process.env.TURSO_DATABASE_URL ? "set" : "missing",
      authToken: process.env.TURSO_AUTH_TOKEN ? "set" : "missing",
      chosenUrl: rawUrl ? rawUrl.slice(0, 48) : "missing",
    })
  }

  if (!rawUrl) {
    throw new Error(
      "DATABASE_URL or TURSO_DATABASE_URL environment variable is not set or is invalid. " +
        "Add a valid value in Vercel (Project → Settings → Environment Variables) or in .env.local.\n" +
        'Example: DATABASE_URL="libsql://your-db.turso.io"',
    )
  }

  const url = normalizeLibSqlUrl(rawUrl)

  const factory = new PrismaLibSQL({
    url,
    ...(authToken ? { authToken } : {}),
  })

  const adapter = await factory.connect()

  return new PrismaClient({ adapter })
}

/**
 * Lazily initializes Prisma with the LibSQL driver adapter factory (Prisma 6+).
 * Do not instantiate `PrismaLibSQL` with a pre-created `createClient()` result —
 * it expects `{ url, authToken }` and will otherwise pass an invalid URL to libsql.
 */
export async function getPrisma(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }
  globalForPrisma.prismaInitialization ??= createPrismaClient()
  globalForPrisma.prisma = await globalForPrisma.prismaInitialization
  return globalForPrisma.prisma
}
