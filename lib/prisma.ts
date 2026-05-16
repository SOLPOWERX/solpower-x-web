import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const prismaClientSingleton = () => {
  const tursoUrl = "https://solpower-db-urieling3-web.aws-us-east-1.turso.io"
  const rawUrl = process.env.TURSO_DATABASE_URL
  
  // Limpieza total de la URL
  let finalUrl = tursoUrl
  if (rawUrl && rawUrl !== "undefined" && rawUrl.length > 5) {
    finalUrl = rawUrl
  }
  
  const authToken = process.env.TURSO_AUTH_TOKEN
  
  console.log("TURSO_DEBUG: URL final detectada ->", finalUrl.substring(0, 20) + "...");

  const libsql = createClient({
    url: finalUrl,
    authToken: authToken || "",
  })
  
  const adapter = new PrismaLibSQL(libsql as any)
  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
