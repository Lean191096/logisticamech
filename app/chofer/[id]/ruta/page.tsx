import { prisma } from "@/lib/prisma";
import RutaClient from "./RutaClient";

export default async function ChoferRutaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const choferId = parseInt(resolvedParams.id, 10);

  // Buscar la ruta mas reciente asignada al chofer
  const ruta = await prisma.ruta.findFirst({
    where: { chofer: { id: choferId } },
    orderBy: { fecha: "desc" },
    include: {
      chofer: true,
      pedidos: {
        include: { cliente: true }
      }
    }
  });

  if (!ruta) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="card text-center">
          <h2>No tienes rutas asignadas hoy</h2>
          <p>Contacta a administracion para mas informacion.</p>
        </div>
      </div>
    );
  }

  // Parse orden de paradas si existe, sino usamos el orden en el que vienen
  let paradas = ruta.pedidos;
  if (ruta.orden_paradas) {
    try {
      const ordenIds = JSON.parse(ruta.orden_paradas);
      paradas = ordenIds.map((id: number) => ruta.pedidos.find(p => p.id === id)).filter(Boolean);
    } catch (e) {
      console.error(e);
    }
  }

  // Find next pending stop
  const currentIndex = paradas.findIndex(p => p.estado !== 'Entregado');

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <header style={{ background: 'var(--primary)', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Ruta #{ruta.id}</h2>
        <a href="/" style={{ fontSize: '0.875rem' }}>Salir</a>
      </header>
      
      <RutaClient paradas={paradas} currentIndex={currentIndex === -1 ? paradas.length : currentIndex} choferNombre={ruta.chofer?.nombre || 'su chofer asignado'} />
    </div>
  );
}
