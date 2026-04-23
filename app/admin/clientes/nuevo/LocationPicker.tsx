"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search, MapPin } from "lucide-react";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapEvents({ onLocationSelected }: { onLocationSelected: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapUpdater({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function LocationPicker() {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState<string>("");
  const [partido, setPartido] = useState<string>("");
  
  const [calleAltura, setCalleAltura] = useState("");
  const [localidad, setLocalidad] = useState("");
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAddressDetails = async (lat: number, lng: number) => {
    try {
      // Usamos ArcGIS REST API que tiene mucha mejor interpolación de alturas en Argentina
      const res = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&location=${lng},${lat}`);
      const data = await res.json();
      if (data && data.address) {
        const adr = data.address;
        const compiledAddress = adr.Address || adr.Match_addr || "";
        
        setAddress(compiledAddress);
        
        // Split for the inputs if we don't have them typed manually
        if (!calleAltura && !localidad) {
          setCalleAltura(compiledAddress.split(',')[0]);
        }
        
        const partidoEncontrado = adr.Subregion || adr.City || adr.District || "Desconocido";
        setPartido(partidoEncontrado);
      }
    } catch (e) {
      console.error("Error fetching address details:", e);
    }
  };

  const handleLocationSelected = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    await fetchAddressDetails(lat, lng);
  };

  const triggerSearch = (calle: string, loc: string) => {
    setShowSuggestions(true);
    
    if (typingTimeout) clearTimeout(typingTimeout);
    
    if (!calle.trim()) {
      setSuggestions([]);
      return;
    }

    setTypingTimeout(setTimeout(async () => {
      try {
        // Combinamos la calle, localidad (si existe), y forzamos Argentina
        let queryToSearch = calle;
        if (loc.trim()) {
          queryToSearch += `, ${loc}`;
        }
        if (!queryToSearch.toLowerCase().includes("argentina")) {
          // Asumimos Buenos Aires por defecto si es el core del negocio, ayuda a la precisión
          queryToSearch += `, Buenos Aires, Argentina`;
        }
        
        let allSuggestions: any[] = [];

        // 1. ArcGIS Geocoding API
        try {
          const resArc = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${encodeURIComponent(queryToSearch)}&maxLocations=5&outFields=PlaceName,City,Region`);
          const dataArc = await resArc.json();
          if (dataArc && dataArc.candidates) {
            allSuggestions = [...dataArc.candidates];
          }
        } catch(e) {}

        // 2. OpenStreetMap (Nominatim) API
        try {
          const resNom = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryToSearch)}&countrycodes=ar&limit=3`);
          const dataNom = await resNom.json();
          if (dataNom && Array.isArray(dataNom)) {
            const nomFormatted = dataNom.map((n: any) => ({
              address: n.display_name,
              location: { x: parseFloat(n.lon), y: parseFloat(n.lat) }
            }));
            allSuggestions = [...allSuggestions, ...nomFormatted];
          }
        } catch(e) {}

        setSuggestions(allSuggestions);
      } catch (e) {
        console.error("Error fetching suggestions:", e);
      }
    }, 300)); // Bajamos el delay a 300ms para que sea MUCHO más rápido
  };

  const handleCalleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCalleAltura(val);
    triggerSearch(val, localidad);
  };

  const handleLocalidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalidad(val);
    triggerSearch(calleAltura, val);
  };

  const handleSelectSuggestion = (suggestion: any) => {
    const lat = suggestion.location.y;
    const lng = suggestion.location.x;
    
    setPosition([lat, lng]);
    
    // Extraemos la primera parte como calle
    const fullAdr = suggestion.address || "";
    setAddress(fullAdr); 
    
    const parts = fullAdr.split(',');
    if (parts.length > 0) setCalleAltura(parts[0].trim());
    if (parts.length > 1) setLocalidad(parts[1].trim());
    
    // El partido a veces viene en atributos, si no lo extraemos de reverseGeocode rápido
    fetchAddressDetails(lat, lng);
    
    setShowSuggestions(false);
  };

  if (!mounted) return <div style={{ height: '500px', background: 'var(--secondary)' }}>Cargando mapa...</div>;

  const defaultCenter: [number, number] = [-34.6037, -58.3816];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      <div style={{ position: 'relative' }}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Input Calle y Altura */}
            <div className="relative flex-1 sm:flex-[2]">
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-foreground)' }} />
              <input 
                type="text" 
                className="input" 
                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 36px', fontSize: '1rem', border: '2px solid var(--border)', borderRadius: 'var(--radius)' }} 
                placeholder="Calle y Altura (Ej: Av. San Martín 1500)" 
                value={calleAltura}
                onChange={handleCalleChange}
                onFocus={() => setShowSuggestions(true)}
              />
            </div>
            
            {/* Input Partido / Localidad */}
            <div className="relative flex-1">
              <input 
                type="text" 
                className="input" 
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '2px solid var(--border)', borderRadius: 'var(--radius)' }} 
                placeholder="Partido / Localidad (Ej: Lanús)" 
                value={localidad}
                onChange={handleLocalidadChange}
                onFocus={() => setShowSuggestions(true)}
              />
            </div>
          </div>
        </div>

        {/* Dropdown de Resultados */}
        {showSuggestions && suggestions.length > 0 && (
          <ul style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
            background: 'var(--background)', border: '1px solid var(--border)', 
            borderRadius: 'var(--radius)', marginTop: '4px', padding: 0, listStyle: 'none',
            boxShadow: 'var(--shadow-md)', maxHeight: '250px', overflowY: 'auto'
          }}>
            {suggestions.map((s, idx) => {
              const fullAddress = s.address || "";
              const parts = fullAddress.split(',');
              
              // Mostrar calle principal arriba y el resto (Partido, Provincia, País) abajo
              const streetName = parts[0]?.trim() || "Dirección Desconocida";
              const localityAndProvince = parts.slice(1).join(', ').trim() || "Buenos Aires, Argentina";

              return (
                <li 
                  key={idx} 
                  onClick={() => handleSelectSuggestion(s)}
                  style={{ 
                    padding: '0.85rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem', transition: 'background 0.2s',
                    color: 'var(--foreground)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <MapPin size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {streetName}
                    </span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{localityAndProvince}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Resultados e Info Geográfica */}
      {address && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem', padding: '1rem', background: 'var(--secondary)', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--primary)' }}>
          <div>
            <strong style={{ display: 'block', color: 'var(--foreground)' }}>Ubicación Confirmada:</strong>
            <span style={{ color: 'var(--secondary-foreground)' }}>{address}</span>
          </div>
          {partido && (
            <div style={{ textAlign: 'right' }}>
              <strong style={{ display: 'block', color: 'var(--foreground)' }}>Partido / Zona:</strong>
              <span className="badge" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>{partido}</span>
            </div>
          )}
        </div>
      )}

      {/* Mapa */}
      <div style={{ height: '400px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
        <MapContainer center={defaultCenter} zoom={12} style={{ height: "100%", width: "100%", zIndex: 0 }}>
          <TileLayer
            attribution='&copy; Google Maps'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          />
          <MapEvents onLocationSelected={handleLocationSelected} />
          <MapUpdater center={position} zoom={16} />
          {position && (
            <Marker 
              position={position} 
              icon={customIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const newPos = marker.getLatLng();
                  setPosition([newPos.lat, newPos.lng]);
                }
              }}
            />
          )}
        </MapContainer>
        
        {/* Helper UI Tooltip over map */}
        {position && (
          <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', zIndex: 1000, pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <MapPin size={16} />
            <span>Puedes arrastrar el pin rojo para ajustar el punto exacto</span>
          </div>
        )}

        {/* Campos ocultos para enviar al Server Action */}
        <input type="hidden" name="direccion" value={address} required />
        <input type="hidden" name="lat" value={position ? position[0] : ""} required />
        <input type="hidden" name="lng" value={position ? position[1] : ""} required />
      </div>

      {!position && (
        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⚠️ ATENCIÓN: Debes seleccionar una dirección de la lista desplegable o hacer clic en el mapa para poder guardar al cliente.
        </div>
      )}
    </div>
  );
}
