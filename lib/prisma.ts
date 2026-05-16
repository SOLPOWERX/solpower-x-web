import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const prismaClientSingleton = () => {
  const tursoUrl = "https://solpower-db-urieling3-web.aws-us-east-1.turso.io"
  
  // Si la variable es nula, vacía o literalmente la palabra "undefined" (común en Vercel build)
  const rawUrl = process.env.TURSO_DATABASE_URL;
  const url = (rawUrl && rawUrl !== "undefined" && rawUrl !== "") ? rawUrl : tursoUrl;
  
  const authToken = process.env.TURSO_AUTH_TOKEN
  
  console.log("Conectando a:", url.substring(0, 15) + "...");

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
