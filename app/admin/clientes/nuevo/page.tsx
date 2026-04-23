import { crearCliente } from "@/app/actions";
import Link from "next/link";
import LocationPickerWrapper from "./LocationPickerWrapper";

export default function NuevoClientePage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Registrar Nuevo Cliente</h1>
        <Link href="/admin/clientes" className="btn btn-secondary">Volver</Link>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form action={crearCliente} className="flex flex-col gap-6">
          <div>
            <label className="block mb-2 font-semibold">Nombre del Cliente</label>
            <input type="text" name="nombre" required className="input" placeholder="Ej: Taller Martínez" />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Teléfono</label>
            <input type="tel" name="telefono" className="input" placeholder="Ej: +54 9 11 1234-5678" />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Ubicación en el Mapa</label>
            <p className="mb-2 text-sm" style={{ color: 'var(--secondary-foreground)' }}>
              Haz clic en el mapa para marcar la ubicación exacta del cliente.
            </p>
            <LocationPickerWrapper />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem', width: '100%' }}>
            Guardar Cliente
          </button>
        </form>
      </div>
    </div>
  );
}
