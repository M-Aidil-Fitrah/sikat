"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import type { LatLngExpression } from 'leaflet';

// Fix Leaflet default marker icon issue in Next.js (only on client-side)
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

interface DisasterData {
  id: number;
  lat: number;
  lng: number;
  namaPelapor: string;
  desaKecamatan: string;
  namaObjek: string;
  jenisKerusakan: string;
  tingkatKerusakan: 'Ringan' | 'Sedang' | 'Berat';
  fotoLokasi: string[];
  keteranganKerusakan: string;
  timestamp: string;
  verified: boolean;
  // Legacy fields for backward compatibility
  type?: string;
  severity?: 'high' | 'medium' | 'low';
}

// Sample disaster data for Sumatera (focus on floods and landslides)
const disasterData: DisasterData[] = [
  {
    id: 1,
    lat: 5.5483,
    lng: 95.3238,
    namaPelapor: 'BPBD Banda Aceh',
    desaKecamatan: 'Banda Aceh Tengah, Banda Aceh',
    namaObjek: 'Pemukiman Padat Penduduk',
    jenisKerusakan: 'Banjir - Rumah tinggal terendam',
    tingkatKerusakan: 'Berat',
    fotoLokasi: ['/placeholder-flood1.jpg', '/placeholder-flood2.jpg', '/placeholder-flood3.jpg'],
    keteranganKerusakan: 'Ketinggian air 1-2 meter, akses jalan tertutup, listrik padam',
    timestamp: '2 jam lalu',
    verified: true,
    type: 'Banjir',
    severity: 'high'
  },
  {
    id: 2,
    lat: 5.5788,
    lng: 95.3450,
    namaPelapor: 'Relawan PMI',
    desaKecamatan: 'Ulee Kareng, Banda Aceh',
    namaObjek: 'Kompleks Perumahan Ulee Kareng',
    jenisKerusakan: 'Banjir - Pemukiman dan fasilitas umum',
    tingkatKerusakan: 'Berat',
    fotoLokasi: ['/placeholder-flood1.jpg', '/placeholder-flood2.jpg'],
    keteranganKerusakan: 'Masjid terendam, puskesmas tidak beroperasi, jalan utama tertutup air',
    timestamp: '3 jam lalu',
    verified: true,
    type: 'Banjir',
    severity: 'high'
  },
  {
    id: 3,
    lat: 5.4891,
    lng: 95.4012,
    namaPelapor: 'BPBD Aceh Besar',
    desaKecamatan: 'Krueng Raya, Aceh Besar',
    namaObjek: 'Jalan Provinsi Km 12',
    jenisKerusakan: 'Longsor - Jalan tertutup material',
    tingkatKerusakan: 'Berat',
    fotoLokasi: ['/placeholder-landslide1.jpg', '/placeholder-landslide2.jpg', '/placeholder-landslide3.jpg'],
    keteranganKerusakan: 'Jalan provinsi tertutup material longsor, 8 rumah rusak berat, akses terputus total',
    timestamp: '5 jam lalu',
    verified: true,
    type: 'Longsor',
    severity: 'high'
  },
  {
    id: 4,
    lat: 5.4683,
    lng: 95.2589,
    namaPelapor: 'Dinas Sosial Aceh Besar',
    desaKecamatan: 'Lhoknga, Aceh Besar',
    namaObjek: 'Pemukiman Pesisir Lhoknga',
    jenisKerusakan: 'Banjir - Rob dan luapan',
    tingkatKerusakan: 'Sedang',
    fotoLokasi: ['/placeholder-flood1.jpg', '/placeholder-flood2.jpg'],
    keteranganKerusakan: 'Air laut pasang tinggi, genangan hingga 50cm, beberapa rumah terendam',
    timestamp: '8 jam lalu',
    verified: true,
    type: 'Banjir',
    severity: 'medium'
  },
  {
    id: 5,
    lat: 5.5234,
    lng: 95.2890,
    namaPelapor: 'BPBD Aceh Besar',
    desaKecamatan: 'Lampisang, Aceh Besar',
    namaObjek: 'Area Persawahan Lampisang',
    jenisKerusakan: 'Longsor - Menimpa pemukiman',
    tingkatKerusakan: 'Sedang',
    fotoLokasi: ['/placeholder-landslide1.jpg', '/placeholder-landslide2.jpg'],
    keteranganKerusakan: 'Material longsor menimpa 2 rumah dan area persawahan seluas 1 hektar',
    timestamp: '12 jam lalu',
    verified: true,
    type: 'Longsor',
    severity: 'medium'
  },
  {
    id: 6,
    lat: 5.8933,
    lng: 95.3214,
    namaPelapor: 'BPBD Sabang',
    desaKecamatan: 'Sukakarya, Sabang',
    namaObjek: 'Permukiman Sukakarya',
    jenisKerusakan: 'Banjir - Genangan air',
    tingkatKerusakan: 'Sedang',
    fotoLokasi: ['/placeholder-flood1.jpg'],
    keteranganKerusakan: 'Drainase tersumbat, genangan merata di permukiman',
    timestamp: '1 hari lalu',
    verified: true,
    type: 'Banjir',
    severity: 'medium'
  },
  {
    id: 7,
    lat: 5.5123,
    lng: 95.3567,
    namaPelapor: 'BPBD Aceh Besar',
    desaKecamatan: 'Blang Bintang, Aceh Besar',
    namaObjek: 'Daerah Aliran Sungai Blang Bintang',
    jenisKerusakan: 'Banjir - Luapan sungai',
    tingkatKerusakan: 'Berat',
    fotoLokasi: ['/placeholder-flood1.jpg', '/placeholder-flood2.jpg', '/placeholder-flood3.jpg'],
    keteranganKerusakan: 'Sungai meluap, ratusan rumah terendam hingga 1.5 meter, jembatan rusak',
    timestamp: '1 hari lalu',
    verified: true,
    type: 'Banjir',
    severity: 'high'
  },
  {
    id: 8,
    lat: 5.4456,
    lng: 95.6234,
    namaPelapor: 'Masyarakat Indrapuri',
    desaKecamatan: 'Indrapuri, Aceh Besar',
    namaObjek: 'Tebing Jalan Desa',
    jenisKerusakan: 'Longsor - Akses jalan terputus',
    tingkatKerusakan: 'Sedang',
    fotoLokasi: ['/placeholder-landslide1.jpg', '/placeholder-landslide2.jpg'],
    keteranganKerusakan: 'Tebing setinggi 10 meter longsor, volume tanah sekitar 200 m³, jalur alternatif tersedia',
    timestamp: '1 hari lalu',
    verified: false,
    type: 'Longsor',
    severity: 'medium'
  },
  {
    id: 9,
    lat: 5.5456,
    lng: 95.3189,
    namaPelapor: 'Lurah Kuta Alam',
    desaKecamatan: 'Kuta Alam, Banda Aceh',
    namaObjek: 'Kelurahan Kuta Alam',
    jenisKerusakan: 'Banjir - Banjir kiriman',
    tingkatKerusakan: 'Sedang',
    fotoLokasi: ['/placeholder-flood1.jpg', '/placeholder-flood2.jpg'],
    keteranganKerusakan: 'Air kiriman dari daerah hulu, genangan 30-70 cm di jalan dan rumah',
    timestamp: '2 hari lalu',
    verified: true,
    type: 'Banjir',
    severity: 'medium'
  },
  {
    id: 10,
    lat: 5.5678,
    lng: 95.3412,
    namaPelapor: 'Relawan Meuraxa',
    desaKecamatan: 'Meuraxa, Banda Aceh',
    namaObjek: 'Beberapa Titik di Meuraxa',
    jenisKerusakan: 'Banjir - Genangan',
    tingkatKerusakan: 'Ringan',
    fotoLokasi: ['/placeholder-flood1.jpg'],
    keteranganKerusakan: 'Genangan di 5 titik, ketinggian 20-40 cm, tidak merusak bangunan',
    timestamp: '2 hari lalu',
    verified: true,
    type: 'Banjir',
    severity: 'low'
  },
  {
    id: 11,
    lat: 5.4234,
    lng: 95.2456,
    namaPelapor: 'BPBD Aceh Besar',
    desaKecamatan: 'Lhok Nga, Aceh Besar',
    namaObjek: 'Jalan Provinsi Lhok Nga',
    jenisKerusakan: 'Longsor - Longsor besar',
    tingkatKerusakan: 'Berat',
    fotoLokasi: ['/placeholder-landslide1.jpg', '/placeholder-landslide2.jpg', '/placeholder-landslide3.jpg'],
    keteranganKerusakan: 'Longsor masif, 5 rumah hancur total, jalan provinsi tertutup sepenuhnya',
    timestamp: '3 hari lalu',
    verified: true,
    type: 'Longsor',
    severity: 'high'
  },
  {
    id: 12,
    lat: 5.5901,
    lng: 95.4123,
    namaPelapor: 'Dinas Pertanian Aceh Besar',
    desaKecamatan: 'Peukan Bada, Aceh Besar',
    namaObjek: 'Area Persawahan Peukan Bada',
    jenisKerusakan: 'Banjir - Persawahan terendam',
    tingkatKerusakan: 'Sedang',
    fotoLokasi: ['/placeholder-flood1.jpg', '/placeholder-flood2.jpg'],
    keteranganKerusakan: 'Lahan pertanian terendam, padi gagal panen, beberapa rumah tergenang',
    timestamp: '3 hari lalu',
    verified: true,
    type: 'Banjir',
    severity: 'medium'
  }
];

// Custom marker icons based on tingkatKerusakan and type
const createCustomIcon = (tingkatKerusakan: string, type?: string) => {
  const color = tingkatKerusakan === 'Berat' ? '#dc2626' : tingkatKerusakan === 'Sedang' ? '#f59e0b' : '#10b981';
  const emoji = type === 'Banjir' ? '💧' : type === 'Longsor' ? '⛰️' : '⚠️';
  
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

export default function MapComponent({ selectedDisaster, onDisasterSelect }: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    // Force remount on component mount to prevent reuse issues
    setMapKey(prev => prev + 1);
    
    return () => {
      setIsMounted(false);
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
    <MapContainer
      center={[5.5483, 95.3238] as LatLngExpression}
      zoom={10}
      style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
      className="z-0"
      key={`map-${mapKey}`}
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {disasterData.map((disaster) => (
        <Marker
          key={disaster.id}
          position={[disaster.lat, disaster.lng] as LatLngExpression}
          icon={createCustomIcon(disaster.tingkatKerusakan, disaster.type)}
          eventHandlers={{
            click: () => onDisasterSelect(disaster)
          }}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-3 h-3 rounded-full ${
                  disaster.tingkatKerusakan === 'Berat' ? 'bg-red-500' :
                  disaster.tingkatKerusakan === 'Sedang' ? 'bg-amber-500' :
                  'bg-green-500'
                }`}></span>
                <h3 className="font-bold text-gray-900">{disaster.type || 'Bencana'}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-1">📍 {disaster.namaObjek}</p>
              <p className="text-sm text-gray-600 mb-1">🏘️ {disaster.desaKecamatan}</p>
              <p className="text-sm text-gray-600 mb-1">⚠️ {disaster.jenisKerusakan}</p>
              <p className="text-xs text-gray-500 mb-2">⏰ {disaster.timestamp}</p>
              <p className="text-sm text-gray-700 mb-2">{disaster.keteranganKerusakan}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{disaster.namaPelapor}</span>
                {disaster.verified && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Terverifikasi</span>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Radius circles for high severity disasters */}
      {disasterData.filter(d => d.tingkatKerusakan === 'Berat').map((disaster) => (
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
