import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ClientesMapWrapper from "./ClientesMapWrapper";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { id: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Clientes</h1>
        <Link href="/admin/clientes/nuevo" className="btn btn-primary">Nuevo Cliente</Link>
      </div>

      <ClientesMapWrapper clientes={clientes} />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>ID</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Nombre</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Dirección</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Teléfono</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>{c.id}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{c.nombre}</td>
                <td style={{ padding: '1rem' }}>{c.direccion}</td>
                <td style={{ padding: '1rem' }}>{c.telefono || '-'}</td>
                <td style={{ padding: '1rem' }}>
                  <div className="flex gap-2">
                    <Link href={`/admin/clientes/${c.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
                      Editar
                    </Link>
                    <form action={async () => {
                      "use server";
                      const { eliminarCliente } = await import('@/app/actions');
                      await eliminarCliente(c.id);
                    }}>
                      <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem', background: 'var(--danger)' }}>
                        Borrar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary-foreground)' }}>
                  No hay clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
