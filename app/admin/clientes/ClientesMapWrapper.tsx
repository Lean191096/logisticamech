"use client";

import dynamic from "next/dynamic";

// Usamos disable SSR para Leaflet
const ClientesMap = dynamic(() => import("./ClientesMap"), { ssr: false });

export default function ClientesMapWrapper({ clientes }: { clientes: any[] }) {
  return <ClientesMap clientes={clientes} />;
}
