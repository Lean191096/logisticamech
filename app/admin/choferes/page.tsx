import { prisma } from "@/lib/prisma";
import { eliminarChofer } from "@/app/actions";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import BotonEditarClave from "./BotonEditarClave";

export default async function ChoferesPage() {
  const choferes = await prisma.chofer.findMany({
    orderBy: { id: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Choferes</h1>
        <Link href="/admin/choferes/nuevo" className="btn btn-primary">Nuevo Chofer</Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>ID</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Nombre</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Usuario</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Clave</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {choferes.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>{c.id}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{c.nombre}</td>
                <td style={{ padding: '1rem' }}><code style={{ background: 'var(--background)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{c.usuario}</code></td>
                <td style={{ padding: '1rem' }}><code style={{ background: 'var(--background)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{c.codigo_acceso}</code></td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <BotonEditarClave choferId={c.id} nombre={c.nombre} />
                    <form action={eliminarChofer.bind(null, c.id)}>
                      <button type="submit" className="btn btn-danger" style={{ padding: '0.5rem' }} title="Eliminar Chofer">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {choferes.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary-foreground)' }}>
                  No hay choferes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
