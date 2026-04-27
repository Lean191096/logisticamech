import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MapWrapper from "../MapWrapper";
import EditRouteList from "./EditRouteList";
import DeleteRouteButton from "./DeleteRouteButton";

export default async function RutaDetallePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const rutaId = parseInt(params.id);
  
  const ruta = await prisma.ruta.findUnique({
    where: { id: rutaId },
    include: { 
      chofer: true, 
      pedidos: { 
        include: { cliente: true } 
      } 
    }
  });

  if (!ruta) {
    return <div>Ruta no encontrada</div>;
  }

  // Bypassing Prisma Client cache for observacion using Raw SQL
  const rawObs = await prisma.$queryRaw<any[]>`SELECT id, observacion FROM Pedido WHERE id IN (${prisma.empty}) OR ruta_id = ${rutaId}`;
  
  // Asignar las observaciones a los pedidos de la ruta
  ruta.pedidos.forEach(p => {
    const rawMatch = rawObs.find((ro: any) => ro.id === p.id);
    if (rawMatch && rawMatch.observacion) {
      (p as any).observacion = rawMatch.observacion;
    }
  });

  // Ordenar pedidos basado en orden_paradas si existe
  let pedidosOrdenados = ruta.pedidos;
  if (ruta.orden_paradas) {
    try {
      const orden = JSON.parse(ruta.orden_paradas) as number[];
      pedidosOrdenados = [...ruta.pedidos].sort((a, b) => {
        const indexA = orden.indexOf(a.id);
        const indexB = orden.indexOf(b.id);
        return indexA - indexB;
      });
    } catch (e) {}
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="mb-2">Recorrido del Chofer: {ruta.chofer.nombre}</h1>
          <p style={{ color: 'var(--secondary-foreground)' }}>Fecha: {ruta.fecha.toLocaleDateString()} - Ruta #{ruta.id}</p>
        </div>
        <div className="flex gap-4">
          <DeleteRouteButton rutaId={ruta.id} />
          <Link href="/admin/rutas" className="btn btn-secondary">
            Volver a Todas las Rutas
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 className="mb-4">Mapa del Recorrido (Tiempo Real)</h3>
          <div style={{ height: '60vh', minHeight: '400px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <MapWrapper rutas={[ruta]} />
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: 'green' }}></span> Entregado</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: 'gold' }}></span> En Camino</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: 'red' }}></span> Rechazado</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: 'blue' }}></span> Pendiente</span>
          </div>
        </div>

        <div className="card">
          <EditRouteList rutaId={ruta.id} pedidosIniciales={pedidosOrdenados} />
        </div>
      </div>
    </div>
  );
}
