"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { DisasterData, Report } from "@/lib/types";
import { getReports } from "@/lib/api";
import { MapPin, Clock, AlertTriangle, FileText, User, CheckCircle, TrendingUp, AlertCircle, RefreshCw, Plus } from "lucide-react";
import Sidebar from "@/app/components/Sidebar";

// Convert UTC to WIB (GMT+7)
const toWIB = (date: Date | string): Date => {
  const utcDate = new Date(date);
  // Add 7 hours for WIB timezone
  return new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
};

// Format detailed timestamp in WIB
const formatDetailedTime = (timestamp: string, dateString: Date | string): string => {
  const wibDate = toWIB(dateString);
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const day = wibDate.getUTCDate();
  const month = months[wibDate.getUTCMonth()];
  const year = wibDate.getUTCFullYear();
  const hours = wibDate.getUTCHours().toString().padStart(2, '0');
  const minutes = wibDate.getUTCMinutes().toString().padStart(2, '0');
  return `${timestamp} (${day} ${month} ${year}, ${hours}:${minutes} WIB)`;
};

// Dynamic import to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center rounded-2xl">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Memuat peta...</p>
      </div>
    </div>
  )
});

const DisasterForm = dynamic(() => import("../components/DisasterForm"), {
  ssr: false
});

// Inner component that uses useSearchParams
function DashboardContent() {
  const searchParams = useSearchParams();
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterData | null>(null);
  const [showInputForm, setShowInputForm] = useState(false);
  const [showDetailOverlay, setShowDetailOverlay] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [disasters, setDisasters] = useState<DisasterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  // Load sidebar state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setSidebarCollapsed(saved === "true");
    }
    
    const handleStorageChange = () => {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved !== null) {
        setSidebarCollapsed(saved === "true");
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 100);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Load disasters from API
  const loadDisasters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getReports();
      setDisasters(data);
    } catch (err) {
      console.error('Error loading disasters:', err);
      setError('Gagal memuat data laporan');
    } finally {
      setIsLoading(false);
    }
  };

  // Load disasters on mount
  useEffect(() => {
    loadDisasters();
  }, []);

  // Handle URL parameters for map navigation
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const id = searchParams.get('id');
    
    if (lat && lng) {
      setMapCenter({ lat: parseFloat(lat), lng: parseFloat(lng) });
      
      // Find and select the disaster if id is provided
      if (id && disasters.length > 0) {
        const disaster = disasters.find(d => d.id === parseInt(id));
        if (disaster) {
          setSelectedDisaster(disaster);
        }
      }
    }
  }, [searchParams, disasters]);

  const handleFormSubmit = (report: Report) => {
    // Reload disasters after successful submission
    loadDisasters();
    setShowInputForm(false);
  };

  const stats = {
    totalReports: disasters.length,
    banjir: disasters.filter(d => d.jenisKerusakan.toLowerCase().includes('banjir')).length,
    longsor: disasters.filter(d => d.jenisKerusakan.toLowerCase().includes('longsor')).length,
    approved: disasters.filter(d => d.status === 'APPROVED').length
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto min-h-screen transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-72"}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Kebencanaan</h1>
              <p className="text-gray-500 mt-1">Pemantauan Bencana Banjir Sumatra </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={loadDisasters}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium shadow-sm"
                disabled={isLoading}
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Memuat...' : 'Refresh'}
              </button>
              <button 
                onClick={() => setShowInputForm(!showInputForm)}
                className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg shadow-red-600/30">
                <Plus className="w-5 h-5" />
                Tambah Laporan
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && disasters.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Memuat data laporan...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-600 shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900">Gagal Memuat Data</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button 
                  onClick={loadDisasters}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-linear-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl shadow-red-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Live</span>
              </div>
              <div className="text-4xl font-bold mb-2">{stats.totalReports}</div>
              <div className="text-red-100 font-medium">Total Laporan</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{disasters.filter(d => d.tingkatKerusakan === 'Berat').length}</div>
              <div className="text-gray-500 font-medium">Kerusakan Berat</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{disasters.filter(d => d.tingkatKerusakan === 'Sedang').length}</div>
              <div className="text-gray-500 font-medium">Kerusakan Sedang</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{disasters.filter(d => d.tingkatKerusakan === 'Ringan').length}</div>
              <div className="text-gray-500 font-medium">Kerusakan Ringan</div>
            </div>
          </div>

          {/* Map and Detail Section */}
          <div className="grid grid-cols-3 gap-6 items-start">
            {/* Map */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-fit">
              <div className="p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Peta Sebaran Laporan Bencana Banjir Sumatra</h2>
                  <p className="text-sm text-gray-500 mt-1">Monitoring Real-time</p>
                </div>
              </div>
              <div className="h-150 relative overflow-hidden">
                <MapComponent 
                  key="dashboard-map"
                  selectedDisaster={selectedDisaster} 
                  onDisasterSelect={setSelectedDisaster}
                  onOpenDetailOverlay={(disaster) => {
                    setSelectedDisaster(disaster);
                    setShowDetailOverlay(true);
                  }}
                  disasters={disasters}
                  isDetailOverlayOpen={showDetailOverlay}
                  mapCenter={mapCenter}
                />
              </div>
            </div>

            {/* Detail Sidebar */}
            <div className="space-y-6">
              {/* Selected Disaster Detail */}
              {selectedDisaster ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-linear-to-r from-red-600 to-orange-600 p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-3 h-3 rounded-full ${
                        selectedDisaster?.tingkatKerusakan === 'Berat' ? 'bg-white' :
                        selectedDisaster?.tingkatKerusakan === 'Sedang' ? 'bg-amber-200' :
                        'bg-green-200'
                      }`}></span>
                      <h3 className="font-bold text-lg">{selectedDisaster?.namaObjek}</h3>
                    </div>
                    <p className="text-red-100 text-sm">Tingkat Kerusakan: {selectedDisaster?.tingkatKerusakan}</p>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {/* Foto Lokasi */}
                    {selectedDisaster.fotoLokasi && selectedDisaster.fotoLokasi.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 font-semibold mb-2">FOTO LOKASI</div>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedDisaster.fotoLokasi.slice(0, 4).map((foto, index) => (
                            <img 
                              key={index}
                              src={foto} 
                              alt={`Foto ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setSelectedPhotoUrl(foto)}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=Foto+Tidak+Tersedia';
                              }}
                            />
                          ))}
                        </div>
                        {selectedDisaster.fotoLokasi.length > 4 && (
                          <p className="text-xs text-gray-500 mt-2">+{selectedDisaster.fotoLokasi.length - 4} foto lainnya</p>
                        )}
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-xs text-gray-500 font-semibold mb-1">KOORDINAT</div>
                      <div className="font-mono text-sm text-gray-900">{selectedDisaster?.lat.toFixed(6)}, {selectedDisaster?.lng.toFixed(6)}</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-xs text-gray-500 font-semibold mb-1">LOKASI</div>
                      <div className="text-sm text-gray-900">{selectedDisaster?.desaKecamatan}</div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Jenis Kerusakan</div>
                          <div className="text-gray-600">{selectedDisaster?.jenisKerusakan}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Tingkat Kerusakan</div>
                          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedDisaster?.tingkatKerusakan === 'Berat' ? 'bg-red-100 text-red-700' :
                            selectedDisaster?.tingkatKerusakan === 'Sedang' ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'
                          }`}>{selectedDisaster?.tingkatKerusakan}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Waktu</div>
                          <div className="text-gray-600 text-sm">
                            {formatDetailedTime(selectedDisaster.timestamp, selectedDisaster.submittedAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Keterangan Kerusakan & Kebutuhan</div>
                          <div className="text-gray-600">{selectedDisaster?.keteranganKerusakan}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Pelapor</div>
                          <div className="text-gray-600">{selectedDisaster?.namaPelapor}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Kontak</div>
                          <div className="text-gray-600">{selectedDisaster?.kontak}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Status</div>
                          {selectedDisaster?.status === 'APPROVED' ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium mt-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Diverifikasi
                            </span>
                          ) : selectedDisaster?.status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium mt-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Ditolak
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium mt-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Menunggu Verifikasi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => setShowDetailOverlay(true)}
                        className="w-full px-4 py-2.5 bg-linear-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all"
                      >
                        Lihat Detail Lengkap
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Pilih Marker</h3>
                  <p className="text-sm text-gray-500">Klik marker pada peta untuk melihat detail informasi bencana</p>
                </div>
              )}

              {/* Recent Reports */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Laporan Terkini</h3>
                </div>
                <div className="divide-y divide-gray-100 max-h-75 overflow-y-auto">
                  {disasters.slice(0, 5).map((disaster) => (
                    <button
                      key={disaster.id}
                      onClick={() => setSelectedDisaster(disaster)}
                      className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                          disaster.tingkatKerusakan === 'Berat' ? 'bg-red-500' :
                          disaster.tingkatKerusakan === 'Sedang' ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}></span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">{disaster.namaObjek}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{disaster.desaKecamatan}</div>
                          <div className="text-xs text-gray-400 mt-1">{disaster.timestamp}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Disaster Form Modal */}
      {showInputForm && (
        <DisasterForm
          onClose={() => setShowInputForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Detail Overlay Modal */}
      {showDetailOverlay && selectedDisaster && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9998 }} onClick={() => setShowDetailOverlay(false)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-linear-to-r from-red-600 to-orange-600 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedDisaster.jenisKerusakan}</h2>
                <p className="text-red-100 mt-1">{selectedDisaster.namaObjek}</p>
              </div>
              <button 
                onClick={() => setShowDetailOverlay(false)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Foto-foto */}
              {selectedDisaster.fotoLokasi && selectedDisaster.fotoLokasi.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Foto Lokasi</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedDisaster.fotoLokasi.map((foto, index) => (
                      <img 
                        key={index}
                        src={foto} 
                        alt={`Foto ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedPhotoUrl(foto)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Foto+Tidak+Tersedia';
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-semibold mb-1">KOORDINAT</div>
                  <div className="font-mono text-sm text-gray-900">{selectedDisaster.lat.toFixed(6)}, {selectedDisaster.lng.toFixed(6)}</div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-semibold mb-1">LOKASI</div>
                  <div className="text-sm text-gray-900">{selectedDisaster.desaKecamatan}</div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-semibold mb-1">TINGKAT KERUSAKAN</div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedDisaster.tingkatKerusakan === 'Berat' ? 'bg-red-100 text-red-700' :
                    selectedDisaster.tingkatKerusakan === 'Sedang' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>{selectedDisaster.tingkatKerusakan}</span>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-semibold mb-1">WAKTU LAPORAN</div>
                  <div className="text-sm text-gray-900">
                    {formatDetailedTime(selectedDisaster.timestamp, selectedDisaster.submittedAt)}
                  </div>
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Keterangan Kerusakan & Kebutuhan</h3>
                <p className="text-gray-700 leading-relaxed">{selectedDisaster.keteranganKerusakan}</p>
              </div>

              {/* Pelapor */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3">Informasi Pelapor</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">{selectedDisaster.namaPelapor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-gray-900">{selectedDisaster.kontak}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
              <button 
                onClick={() => setShowDetailOverlay(false)}
                className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {selectedPhotoUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4"
          style={{ zIndex: 10000 }}
          onClick={() => setSelectedPhotoUrl(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
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

// Main export with Suspense boundary for useSearchParams
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
