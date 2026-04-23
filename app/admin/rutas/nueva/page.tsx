import { prisma } from "@/lib/prisma";
import RouteGeneratorFlow from "./RouteGeneratorFlow";

export default async function NuevaRutaPage() {
  const choferes = await prisma.chofer.findMany();
  const clientes = await prisma.cliente.findMany({
    orderBy: { nombre: "asc" }
  });

  return (
    <RouteGeneratorFlow choferes={choferes} clientes={clientes} />
  );
}
