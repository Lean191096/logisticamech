"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

type ClienteMapData = {
  id: number;
  nombre: string;
  direccion: string;
  lat: number | null;
  lng: number | null;
};

export default function ClientesMap({ clientes }: { clientes: ClienteMapData[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ height: '400px', background: 'var(--secondary)', borderRadius: 'var(--radius)' }}>Cargando mapa...</div>;

  const validClientes = clientes.filter(c => c.lat !== null && c.lng !== null);
  
  // Calcular el centro. Por defecto Buenos Aires si no hay clientes.
  let center: [number, number] = [-34.6037, -58.3816];
  if (validClientes.length > 0) {
    const sumLat = validClientes.reduce((sum, c) => sum + c.lat!, 0);
    const sumLng = validClientes.reduce((sum, c) => sum + c.lng!, 0);
    center = [sumLat / validClientes.length, sumLng / validClientes.length];
  }

  return (
    <div style={{ height: '400px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative', zIndex: 0, marginBottom: '2rem' }}>
      <MapContainer center={center} zoom={validClientes.length > 0 ? 11 : 10} style={{ height: "100%", width: "100%", zIndex: 0 }}>
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />
        {validClientes.map(cliente => (
          <Marker 
            key={cliente.id} 
            position={[cliente.lat!, cliente.lng!]} 
            icon={customIcon}
          >
            <Popup>
              <div style={{ padding: '0.2rem' }}>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--primary)' }}>{cliente.nombre}</strong>
                <span style={{ fontSize: '0.85rem' }}>{cliente.direccion}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--card)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', zIndex: 1000, boxShadow: 'var(--shadow-sm)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MapPin size={16} style={{ color: 'var(--primary)' }} />
        {validClientes.length} {validClientes.length === 1 ? 'cliente ubicado' : 'clientes ubicados'}
      </div>
    </div>
  );
}
