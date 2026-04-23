const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const chofer = await prisma.chofer.findFirst({ where: { codigo_acceso: '1234' } })
  const pedidos = await prisma.pedido.findMany({ where: { estado: 'Pendiente' } })
  
  if (chofer && pedidos.length > 0) {
    const orden = pedidos.map(p => p.id);
    
    const ruta = await prisma.ruta.create({
      data: {
        chofer_id: chofer.id,
        orden_paradas: JSON.stringify(orden),
        fecha: new Date(),
      }
    })
    
    for (const p of pedidos) {
      await prisma.pedido.update({
        where: { id: p.id },
        data: { ruta_id: ruta.id }
      })
    }
    
    console.log(`Ruta creada con ID ${ruta.id} asignada al chofer ${chofer.nombre}`)
  } else {
    console.log('Faltan datos para crear la ruta')
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
