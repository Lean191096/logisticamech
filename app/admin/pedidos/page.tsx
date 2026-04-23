import { prisma } from "@/lib/prisma";
import { crearPedidoDePrueba } from "@/app/actions";

export default async function PedidosPage() {
  const pedidos = await prisma.pedido.findMany({
    include: {
      cliente: true,
      ruta: {
        include: { chofer: true }
      }
    },
    orderBy: { fecha: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Pedidos</h1>
        <form action={crearPedidoDePrueba}>
          <button type="submit" className="btn btn-primary">Nuevo Pedido (Prueba)</button>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>ID</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Cliente</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Fecha</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Estado</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Ruta / Chofer</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>{p.id}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{p.cliente.nombre}</td>
                <td style={{ padding: '1rem' }}>{p.fecha.toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${p.estado === 'Entregado' ? 'badge-success' : 'badge-warning'}`}>
                    {p.estado}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {p.ruta ? `Ruta #${p.ruta.id} (${p.ruta.chofer.nombre})` : '-'}
                </td>
              </tr>
            ))}
            {pedidos.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary-foreground)' }}>
                  No hay pedidos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
