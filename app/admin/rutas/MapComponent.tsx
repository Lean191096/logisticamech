"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const getNumberedIcon = (estado: string, number: number | string) => {
  let color = "var(--primary)";
  if (estado === "Entregado") color = "var(--success)";
  else if (estado === "No Entregado" || estado === "Rechazado") color = "var(--danger)";
  else if (estado === "En Camino") color = "var(--warning)";
  else if (estado === "Base") color = "#000";

  return L.divIcon({
    html: `<div style="background: ${color}; color: white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);">${number}</div>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

export default function MapComponent({ rutas }: { rutas: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ height: '100%', background: 'var(--secondary)' }}>Cargando mapa...</div>;

  // Centro aproximado (Mech Ituzaingó exacto)
  const center: [number, number] = [-34.6292, -58.6842];

  return (
    <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }}>
      <TileLayer
        attribution='&copy; Google Maps'
        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
      />
      
      {/* Base Marker */}
      <Marker position={[-34.6292, -58.6842]} icon={getNumberedIcon('Base', 'H')}>
        <Popup><strong>MECH LA BASE</strong><br/>Colectora Presidente Perón 8107</Popup>
      </Marker>

      {rutas.map(r => {
        let pedidosOrdenados = r.pedidos;
        if (r.orden_paradas) {
          try {
            const orden = JSON.parse(r.orden_paradas) as number[];
            pedidosOrdenados = [...r.pedidos].sort((a, b) => {
              return orden.indexOf(a.id) - orden.indexOf(b.id);
            });
          } catch (e) {}
        }

        return pedidosOrdenados.map((p: any, idx: number) => (
          <Marker key={p.id} position={[p.cliente.lat, p.cliente.lng]} icon={getNumberedIcon(p.estado, idx + 1)}>
            <Popup>
              <strong>{idx + 1}. {p.cliente.nombre}</strong><br/>
              {p.cliente.direccion}<br/>
              Pedido #{p.id} - Estado: <strong>{p.estado}</strong>
              {p.observacion && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <strong>Motivo:</strong> {p.observacion}
                </div>
              )}
            </Popup>
          </Marker>
        ));
      })}
    </MapContainer>
  );
}
