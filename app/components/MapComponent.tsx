"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import type { LatLngExpression } from 'leaflet';
import { Droplets, Mountain, MapPin, Clock, AlertTriangle, FileText, User, CheckCircle } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import type { DisasterData } from '@/lib/types';

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

// Custom marker icons based on tingkatKerusakan and jenisKerusakan
const createCustomIcon = (tingkatKerusakan: string, jenisKerusakan: string) => {
  const color = tingkatKerusakan === 'Berat' ? '#dc2626' : tingkatKerusakan === 'Sedang' ? '#f59e0b' : '#10b981';
  
  let iconSvg = '';
  const jenisLower = jenisKerusakan.toLowerCase();
  if (jenisLower.includes('banjir')) {
    iconSvg = renderToString(<Droplets className="w-5 h-5" />);
  } else if (jenisLower.includes('longsor')) {
    iconSvg = renderToString(<Mountain className="w-5 h-5" />);
  } else {
    iconSvg = renderToString(<AlertTriangle className="w-5 h-5" />);
  }
  
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
          <Popup>
            <div className="p-2 min-w-50">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-3 h-3 rounded-full ${
                  disaster.tingkatKerusakan === 'Berat' ? 'bg-red-500' :
                  disaster.tingkatKerusakan === 'Sedang' ? 'bg-amber-500' :
                  'bg-green-500'
                }`}></span>
                <h3 className="font-bold text-gray-900">{disaster.jenisKerusakan}</h3>
              </div>
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600">{disaster.namaObjek}</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600">{disaster.desaKecamatan}</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <p className="text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      disaster.tingkatKerusakan === 'Berat' ? 'bg-red-100 text-red-700' :
                      disaster.tingkatKerusakan === 'Sedang' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {disaster.tingkatKerusakan}
                    </span>
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-500">{disaster.timestamp}</p>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700">{disaster.keteranganKerusakan}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-1 mb-1">
                  <User className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">{disaster.namaPelapor}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">📞 {disaster.kontak}</span>
                </div>
              </div>
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
    </div>
  );
}
