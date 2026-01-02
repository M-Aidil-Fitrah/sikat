"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import type { LatLngExpression } from 'leaflet';
import { Droplets, Mountain, MapPin, Clock, AlertTriangle, FileText, User, CheckCircle } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import type { DisasterData } from '@/lib/types';

// Format detailed timestamp
const formatDetailedTime = (timestamp: string, dateString: Date | string): string => {
  const date = new Date(dateString);
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${timestamp} (${day} ${month} ${year}, ${hours}:${minutes})`;
};

// Extend HTMLElement to include _leaflet_id
declare global {
  interface HTMLElement {
    _leaflet_id?: number;
  }
}

// Fix Leaflet default marker icon issue in Next.js (only on client-side)
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Custom marker icons based on tingkatKerusakan
const createCustomIcon = (tingkatKerusakan: string, jenisKerusakan: string) => {
  const color = tingkatKerusakan === 'Berat' ? '#dc2626' : tingkatKerusakan === 'Sedang' ? '#f59e0b' : '#10b981';
  
  // Gunakan AlertTriangle untuk semua jenis kerusakan
  const iconSvg = renderToString(<AlertTriangle className="w-5 h-5" />);
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 12px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="color: white;">
          ${iconSvg}
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19]
  });
};

const getSeverityColor = (tingkatKerusakan: string) => {
  switch (tingkatKerusakan) {
    case 'Berat':
      return '#dc2626';
    case 'Sedang':
      return '#f59e0b';
    case 'Ringan':
      return '#10b981';
    default:
      return '#6b7280';
  }
};

interface MapComponentProps {
  selectedDisaster: DisasterData | null;
  onDisasterSelect: (disaster: DisasterData) => void;
  disasters?: DisasterData[];
}

function MapEvents({ selectedDisaster, onDisasterSelect }: MapComponentProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedDisaster) {
      map.setView([selectedDisaster.lat, selectedDisaster.lng] as LatLngExpression, 13);
    }
  }, [selectedDisaster, map]);

  return null;
}

export default function MapComponent({ selectedDisaster, onDisasterSelect, disasters = [] }: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [mapId] = useState(() => `map-${Math.random().toString(36).substr(2, 9)}`);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
    return () => {
      setIsMounted(false);
      // Cleanup any existing map containers
      if (typeof window !== 'undefined') {
        const containers = document.querySelectorAll('.leaflet-container');
        containers.forEach(container => {
          const leafletContainer = container as HTMLElement;
          if (leafletContainer._leaflet_id) {
            delete leafletContainer._leaflet_id;
          }
        });
      }
    };
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center rounded-2xl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat peta...</p>
        </div>
      </div>
    );
  }

  return (
    <div key={mapKey} className="w-full h-full">
      <MapContainer
        center={[5.5483, 95.3238] as LatLngExpression}
        zoom={10}
        style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
        className="z-0"
        id={mapId}
        scrollWheelZoom={true}
        zoomControl={true}
      >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {disasters.map((disaster) => (
        <Marker
          key={disaster.id}
          position={[disaster.lat, disaster.lng] as LatLngExpression}
          icon={createCustomIcon(disaster.tingkatKerusakan, disaster.jenisKerusakan)}
          eventHandlers={{
            click: () => onDisasterSelect(disaster)
          }}
        >
          <Popup maxWidth={340}>
            <div style={{ minWidth: '300px' }}>
              {/* Header dengan severity badge */}
              <div className="mb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 text-base flex-1">{disaster.jenisKerusakan}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                    disaster.tingkatKerusakan === 'Berat' ? 'bg-red-100 text-red-700' :
                    disaster.tingkatKerusakan === 'Sedang' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {disaster.tingkatKerusakan}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {formatDetailedTime(disaster.timestamp, disaster.submittedAt)}
                  </p>
                </div>
              </div>

              {/* Foto jika ada */}
              {disaster.fotoLokasi && disaster.fotoLokasi.length > 0 && (
                <div className="mb-3">
                  <img 
                    src={disaster.fotoLokasi[0]} 
                    alt="Foto lokasi" 
                    className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedPhotoUrl(disaster.fotoLokasi[0])}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {disaster.fotoLokasi.length > 1 && (
                    <p className="text-xs text-gray-500 mt-1.5">+{disaster.fotoLokasi.length - 1} foto lainnya</p>
                  )}
                </div>
              )}

              {/* Info lokasi */}
              <div className="space-y-2.5 mb-3">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div className="text-sm flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{disaster.namaObjek}</p>
                    <p className="text-gray-600 text-xs mt-0.5">{disaster.desaKecamatan}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 line-clamp-2 flex-1 min-w-0">{disaster.keteranganKerusakan}</p>
                </div>
              </div>

              {/* Pelapor info */}
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 flex-1 min-w-0">{disaster.namaPelapor}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-gray-400 shrink-0">📞</span>
                  <span className="text-sm text-gray-700 flex-1 min-w-0">{disaster.kontak}</span>
                </div>
              </div>

              {/* Tombol detail */}
              <button
                onClick={() => onDisasterSelect(disaster)}
                className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Lihat Detail Lengkap
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Radius circles for high severity disasters */}
      {disasters.filter(d => d.tingkatKerusakan === 'Berat').map((disaster) => (
        <Circle
          key={`circle-${disaster.id}`}
          center={[disaster.lat, disaster.lng] as LatLngExpression}
          radius={2000}
          pathOptions={{
            color: '#dc2626',
            fillColor: '#dc2626',
            fillOpacity: 0.1,
            weight: 1
          }}
        />
      ))}

      <MapEvents selectedDisaster={selectedDisaster} onDisasterSelect={onDisasterSelect} />
    </MapContainer>

    {/* Photo Viewer Modal */}
    {selectedPhotoUrl && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4"
        style={{ zIndex: 9999 }}
        onClick={() => setSelectedPhotoUrl(null)}
      >
        <button 
          className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
          onClick={() => setSelectedPhotoUrl(null)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img 
          src={selectedPhotoUrl} 
          alt="Full view" 
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    )}
    </div>
  );
}
