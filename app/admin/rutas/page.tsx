import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MapWrapper from "./MapWrapper";

export default async function RutasPage() {
  const rutas = await prisma.ruta.findMany({
    include: { chofer: true, pedidos: { include: { cliente: true } } },
    orderBy: { fecha: "desc" }
  });

  const choferes = await prisma.chofer.findMany();
  const pedidosPendientes = await prisma.pedido.findMany({
    where: { estado: 'Pendiente', ruta_id: null },
    include: { cliente: true }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Rutas & Seguimiento</h1>
        <Link href="/admin/rutas/nueva" className="btn btn-primary">
          Armar Hoja de Ruta ({pedidosPendientes.length} pendientes)
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 className="mb-4">Mapa en Tiempo Real</h3>
          <div style={{ height: '65vh', minHeight: '500px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)' }}>
            <MapWrapper rutas={rutas} />
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4">Rutas Activas</h3>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {rutas.map(r => (
              <div key={r.id} style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
                <div className="flex justify-between mb-2">
                  <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>Ruta #{r.id}</strong>
                  <span className="badge badge-success">{r.fecha.toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                  <strong>Chofer:</strong> {r.chofer.nombre}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--secondary-foreground)', opacity: 0.8, marginBottom: '1rem', flex: 1 }}>
                  {r.pedidos.length} pedidos asignados
                </div>
                <Link href={`/admin/rutas/${r.id}`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Ver Recorrido Completo
                </Link>
              </div>
            ))}
            {rutas.length === 0 && <p style={{ color: 'var(--secondary-foreground)', gridColumn: '1 / -1' }}>No hay rutas activas en este momento.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
