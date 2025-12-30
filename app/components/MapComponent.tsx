"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import type { LatLngExpression } from 'leaflet';

// Fix Leaflet default marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface DisasterData {
  id: number;
  location: string;
  region: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  kk: number;
  jiwa: number;
  lat: number;
  lng: number;
  timestamp: string;
  damage: string;
  reporter: string;
  verified: boolean;
}

// Sample disaster data for Sumatera (focus on floods and landslides)
const disasterData: DisasterData[] = [
  {
    id: 1,
    location: 'Banda Aceh Tengah',
    region: 'Banda Aceh',
    type: 'Banjir',
    severity: 'high',
    kk: 147,
    jiwa: 589,
    lat: 5.5483,
    lng: 95.3238,
    timestamp: '2 jam lalu',
    damage: 'Rumah tinggal terendam, ketinggian air 1-2 meter',
    reporter: 'BPBD Banda Aceh',
    verified: true
  },
  {
    id: 2,
    location: 'Ulee Kareng',
    region: 'Banda Aceh',
    type: 'Banjir',
    severity: 'high',
    kk: 89,
    jiwa: 356,
    lat: 5.5788,
    lng: 95.3450,
    timestamp: '3 jam lalu',
    damage: 'Pemukiman padat terendam, fasilitas umum terdampak',
    reporter: 'Relawan PMI',
    verified: true
  },
  {
    id: 3,
    location: 'Krueng Raya',
    region: 'Aceh Besar',
    type: 'Longsor',
    severity: 'high',
    kk: 124,
    jiwa: 496,
    lat: 5.4891,
    lng: 95.4012,
    timestamp: '5 jam lalu',
    damage: 'Jalan utama tertutup material longsor, 8 rumah rusak berat',
    reporter: 'BPBD Aceh Besar',
    verified: true
  },
  {
    id: 4,
    location: 'Lhoknga',
    region: 'Aceh Besar',
    type: 'Banjir',
    severity: 'medium',
    kk: 67,
    jiwa: 268,
    lat: 5.4683,
    lng: 95.2589,
    timestamp: '8 jam lalu',
    damage: 'Pemukiman pesisir terendam rob dan banjir',
    reporter: 'Dinas Sosial',
    verified: true
  },
  {
    id: 5,
    location: 'Lampisang',
    region: 'Aceh Besar',
    type: 'Longsor',
    severity: 'medium',
    kk: 45,
    jiwa: 180,
    lat: 5.5234,
    lng: 95.2890,
    timestamp: '12 jam lalu',
    damage: 'Longsor menimpa area persawahan dan 2 rumah',
    reporter: 'BPBD Aceh Besar',
    verified: true
  },
  {
    id: 6,
    location: 'Sukakarya',
    region: 'Sabang',
    type: 'Banjir',
    severity: 'medium',
    kk: 56,
    jiwa: 224,
    lat: 5.8933,
    lng: 95.3214,
    timestamp: '1 hari lalu',
    damage: 'Genangan air di permukiman warga',
    reporter: 'BPBD Sabang',
    verified: true
  },
  {
    id: 7,
    location: 'Blang Bintang',
    region: 'Aceh Besar',
    type: 'Banjir',
    severity: 'high',
    kk: 156,
    jiwa: 624,
    lat: 5.5123,
    lng: 95.3567,
    timestamp: '1 hari lalu',
    damage: 'Luapan sungai, ratusan rumah terendam',
    reporter: 'BPBD Aceh Besar',
    verified: true
  },
  {
    id: 8,
    location: 'Indrapuri',
    region: 'Aceh Besar',
    type: 'Longsor',
    severity: 'medium',
    kk: 34,
    jiwa: 136,
    lat: 5.4456,
    lng: 95.6234,
    timestamp: '1 hari lalu',
    damage: 'Tebing setinggi 10 meter longsor, akses jalan terputus',
    reporter: 'Masyarakat',
    verified: false
  },
  {
    id: 9,
    location: 'Kuta Alam',
    region: 'Banda Aceh',
    type: 'Banjir',
    severity: 'medium',
    kk: 78,
    jiwa: 312,
    lat: 5.5456,
    lng: 95.3189,
    timestamp: '2 hari lalu',
    damage: 'Banjir kiriman dari hulu sungai',
    reporter: 'Lurah Kuta Alam',
    verified: true
  },
  {
    id: 10,
    location: 'Meuraxa',
    region: 'Banda Aceh',
    type: 'Banjir',
    severity: 'low',
    kk: 42,
    jiwa: 168,
    lat: 5.5678,
    lng: 95.3412,
    timestamp: '2 hari lalu',
    damage: 'Genangan setinggi 30-50 cm di beberapa titik',
    reporter: 'Relawan',
    verified: true
  },
  {
    id: 11,
    location: 'Lhok Nga',
    region: 'Aceh Besar',
    type: 'Longsor',
    severity: 'high',
    kk: 67,
    jiwa: 268,
    lat: 5.4234,
    lng: 95.2456,
    timestamp: '3 hari lalu',
    damage: 'Longsor besar menutup jalan provinsi, 5 rumah hancur',
    reporter: 'BPBD Aceh Besar',
    verified: true
  },
  {
    id: 12,
    location: 'Peukan Bada',
    region: 'Aceh Besar',
    type: 'Banjir',
    severity: 'medium',
    kk: 91,
    jiwa: 364,
    lat: 5.5901,
    lng: 95.4123,
    timestamp: '3 hari lalu',
    damage: 'Persawahan terendam, rumah warga tergenang',
    reporter: 'Dinas Pertanian',
    verified: true
  }
];

// Custom marker icons based on severity and type
const createCustomIcon = (severity: string, type: string) => {
  const color = severity === 'high' ? '#dc2626' : severity === 'medium' ? '#f59e0b' : '#10b981';
  const emoji = type === 'Banjir' ? '💧' : '⛰️';
  
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
        <span style="
          color: white;
          font-size: 20px;
          font-weight: bold;
        ">${emoji}</span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19]
  });
};

interface MapComponentProps {
  selectedDisaster: DisasterData | null;
  onDisasterSelect: (disaster: DisasterData) => void;
}

function MapEvents({ selectedDisaster, onDisasterSelect }: MapComponentProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedDisaster) {
      map.setView([selectedDisaster.lat, selectedDisaster.lng], 13);
    }
  }, [selectedDisaster, map]);

  return null;
}

export default function MapComponent({ selectedDisaster, onDisasterSelect }: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center rounded-2xl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat peta...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[5.5483, 95.3238] as LatLngExpression}
      zoom={10}
      style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {disasterData.map((disaster) => (
        <Marker
          key={disaster.id}
          position={[disaster.lat, disaster.lng] as LatLngExpression}
          icon={createCustomIcon(disaster.severity, disaster.type)}
          eventHandlers={{
            click: () => onDisasterSelect(disaster)
          }}
        >
          <Popup>
            <div className="p-2 min-w-50">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-3 h-3 rounded-full ${
                  disaster.severity === 'high' ? 'bg-red-500' :
                  disaster.severity === 'medium' ? 'bg-amber-500' :
                  'bg-green-500'
                }`}></span>
                <h3 className="font-bold text-gray-900">{disaster.type}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-1">📍 {disaster.location}</p>
              <p className="text-sm text-gray-600 mb-1">🏘️ {disaster.region}</p>
              <p className="text-sm text-gray-600 mb-1">👨‍👩‍👧‍👦 {disaster.kk} KK / {disaster.jiwa} Jiwa</p>
              <p className="text-xs text-gray-500 mb-2">⏰ {disaster.timestamp}</p>
              <p className="text-sm text-gray-700 mb-2">{disaster.damage}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{disaster.reporter}</span>
                {disaster.verified && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Terverifikasi</span>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Radius circles for high severity disasters */}
      {disasterData.filter(d => d.severity === 'high').map((disaster) => (
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
  );
}

export { disasterData };
export type { DisasterData };
