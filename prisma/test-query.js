const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    const choferId = 1;
    // Trying the first approach
    const r1 = await prisma.ruta.findFirst({
      where: { chofer_id: choferId }
    })
    console.log("chofer_id works:", r1?.id)
  } catch (e) {
    console.log("chofer_id failed:", e.message)
  }
  
  try {
    const choferId = 1;
    // Trying the second approach
    const r2 = await prisma.ruta.findFirst({
      where: { chofer: { id: choferId } }
    })
    console.log("chofer object works:", r2?.id)
  } catch (e) {
    console.log("chofer object failed:", e.message)
  }
}

main().catch(console.error)
