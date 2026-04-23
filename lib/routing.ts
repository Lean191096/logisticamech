import { prisma } from "./prisma";

// Función para calcular la distancia Haversine entre dos puntos (en km)
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radio de la tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function generarRutaOptima() {
  // Obtener pedidos pendientes
  const pedidosPendientes = await prisma.pedido.findMany({
    where: { estado: 'Pendiente', ruta_id: null },
    include: { cliente: true }
  });

  if (pedidosPendientes.length === 0) {
    return { error: "No hay pedidos pendientes para rutear." };
  }

  // Obtener choferes disponibles (por simplicidad, tomamos el primer chofer o uno con menos rutas hoy)
  const chofer = await prisma.chofer.findFirst();
  if (!chofer) {
    return { error: "No hay choferes disponibles en el sistema." };
  }

  return await calcularRutaTSP(chofer.id, pedidosPendientes.map(p => p.id));
}

export async function generarRutaPersonalizadaOpts(choferId: number, pedidoIds: number[]) {
  return await calcularRutaTSP(choferId, pedidoIds);
}

// Lógica Core de Enrutamiento
async function calcularRutaTSP(choferId: number, pedidoIds: number[]) {
  if (pedidoIds.length === 0) return { error: "No seleccionaste ningún pedido." };

  const pedidos = await prisma.pedido.findMany({
    where: { id: { in: pedidoIds } },
    include: { cliente: true }
  });
  
  const chofer = await prisma.chofer.findUnique({ where: { id: choferId } });
  if (!chofer) return { error: "Chofer no encontrado." };

  // Punto de partida fijo: Colectora Presidente Perón 8107
  let currentLat = -34.6292;
  let currentLng = -58.6842;

  const unvisited = [...pedidos];
  const routeOrderIds: number[] = [];

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const p = unvisited[i];
      const dist = haversineDistance(currentLat, currentLng, p.cliente.lat, p.cliente.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    const nextStop = unvisited[nearestIdx];
    routeOrderIds.push(nextStop.id);
    currentLat = nextStop.cliente.lat;
    currentLng = nextStop.cliente.lng;
    unvisited.splice(nearestIdx, 1);
  }

  // Crear la ruta en la base de datos
  const ruta = await prisma.ruta.create({
    data: {
      chofer_id: chofer.id,
      orden_paradas: JSON.stringify(routeOrderIds),
    }
  });

  // Actualizar los pedidos con el ID de la ruta
  for (const pedidoId of routeOrderIds) {
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: { ruta_id: ruta.id }
    });
  }

  return { success: true, rutaId: ruta.id, chofer: chofer.nombre, paradas: routeOrderIds.length };
}

export async function previsualizarRutaTSP(choferId: number, clienteIds: number[]) {
  if (clienteIds.length === 0) return { error: "No seleccionaste ningún cliente." };

  const clientes = await prisma.cliente.findMany({
    where: { id: { in: clienteIds } }
  });
  
  const chofer = await prisma.chofer.findUnique({ where: { id: choferId } });
  if (!chofer) return { error: "Chofer no encontrado." };

  // Punto de partida fijo: Colectora Presidente Perón 8107
  let currentLat = -34.6292;
  let currentLng = -58.6842;

  const unvisited = [...clientes];
  const orderedClientes: typeof clientes = [];

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const c = unvisited[i];
      const dist = haversineDistance(currentLat, currentLng, c.lat, c.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    const nextStop = unvisited[nearestIdx];
    orderedClientes.push(nextStop);
    currentLat = nextStop.lat;
    currentLng = nextStop.lng;
    unvisited.splice(nearestIdx, 1);
  }

  return { 
    success: true, 
    chofer: { id: chofer.id, nombre: chofer.nombre }, 
    paradas: orderedClientes,
    base: { lat: -34.6292, lng: -58.6842 }
  };
}
