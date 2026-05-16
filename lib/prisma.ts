import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const prismaClientSingleton = () => {
  // Hardcoded fallback to ensure it NEVER is undefined in Vercel
  const tursoUrl = "https://solpower-db-urieling3-web.aws-us-east-1.turso.io"
  const url = process.env.TURSO_DATABASE_URL || tursoUrl
  const authToken = process.env.TURSO_AUTH_TOKEN
  
  console.log("Iniciando Prisma con URL:", url ? "Definida" : "FALLO");

  const libsql = createClient({
    url: url,
    authToken: authToken,
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
