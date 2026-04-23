import { prisma } from "@/lib/prisma";
import { actualizarCliente } from "@/app/actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import LocationPickerWrapper from "../nuevo/LocationPickerWrapper"; // Reusing the map

export default async function EditarClientePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({
    where: { id: parseInt(id) }
  });

  if (!cliente) {
    redirect('/admin/clientes');
  }

  const updateAction = actualizarCliente.bind(null, cliente.id);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Editar Cliente: {cliente.nombre}</h1>
        <Link href="/admin/clientes" className="btn btn-secondary">Volver</Link>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form action={updateAction} className="flex flex-col gap-6">
          <div>
            <label className="block mb-2 font-semibold">Nombre del Cliente</label>
            <input type="text" name="nombre" defaultValue={cliente.nombre} required className="input" />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Teléfono</label>
            <input type="tel" name="telefono" defaultValue={cliente.telefono || ''} className="input" placeholder="Ej: +54 9 11 1234-5678" />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Ubicación en el Mapa</label>
            <p className="mb-2 text-sm" style={{ color: 'var(--secondary-foreground)' }}>
              Ubicación actual: {cliente.direccion}. Si no seleccionas nada nuevo, se conservará la ubicación actual.
            </p>
            <LocationPickerWrapper />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem', width: '100%' }}>
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}
