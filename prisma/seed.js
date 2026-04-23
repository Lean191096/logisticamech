const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const chofer = await prisma.chofer.upsert({
    where: { codigo_acceso: '1234' },
    update: {},
    create: {
      nombre: 'Juan Perez',
      usuario: 'jperez',
      codigo_acceso: '1234'
    }
  })

  console.log({ chofer })

  // Some clients in Buenos Aires (example coords)
  const clientes = [
    { nombre: 'Ferreteria Los Amigos', direccion: 'Av. Corrientes 1234, CABA', lat: -34.6037, lng: -58.3816 },
    { nombre: 'Taller San Jose', direccion: 'Av. Rivadavia 4567, CABA', lat: -34.6186, lng: -58.4287 },
    { nombre: 'Mecanica Integral', direccion: 'Av. Cabildo 1000, CABA', lat: -34.5684, lng: -58.4485 },
  ]

  for (const c of clientes) {
    const cliente = await prisma.cliente.create({
      data: c
    })
    console.log(`Created client: ${cliente.nombre}`)
    
    // Create an order for each client
    await prisma.pedido.create({
      data: {
        cliente_id: cliente.id,
        estado: 'Pendiente',
      }
    })
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
