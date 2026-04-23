import { crearChofer } from "@/app/actions";
import Link from "next/link";

export default function NuevoChoferPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Registrar Nuevo Chofer</h1>
        <Link href="/admin/choferes" className="btn btn-secondary">Volver</Link>
      </div>

      <div className="card" style={{ maxWidth: '500px' }}>
        <form action={crearChofer} className="flex flex-col gap-6">
          <div>
            <label className="block mb-2 font-semibold">Nombre Completo</label>
            <input type="text" name="nombre" required className="input" placeholder="Ej: Carlos Silva" />
          </div>

          <div className="alert" style={{ background: 'var(--secondary)', padding: '1rem', borderRadius: 'var(--radius)' }}>
            <p className="text-sm" style={{ color: 'var(--secondary-foreground)', margin: 0 }}>
              El sistema generará automáticamente un <strong>Usuario</strong> y una <strong>Clave Segura</strong> para este chofer al guardarlo. Podrás ver estas credenciales en la tabla de choferes.
            </p>
          </div>

          <button type="submit" className="btn btn-primary mt-4" style={{ padding: '0.75rem' }}>
            Generar Credenciales y Guardar
          </button>
        </form>
      </div>
    </div>
  );
}
