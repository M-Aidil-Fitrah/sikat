"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { DisasterData, disasterData } from "../components/MapComponent";
import { MapPin, Clock, AlertTriangle, FileText, User, CheckCircle, TrendingUp, Droplets, Mountain } from "lucide-react";

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

export default function Dashboard() {
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterData | null>(null);
  const [showInputForm, setShowInputForm] = useState(false);
  const [disasters, setDisasters] = useState<DisasterData[]>([]);

  // Load disasters from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sikat_disasters');
    if (saved) {
      try {
        setDisasters(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading disasters:', error);
        setDisasters(disasterData);
      }
    } else {
      setDisasters(disasterData);
    }
  }, []);

  // Save disasters to localStorage whenever it changes
  useEffect(() => {
    if (disasters.length > 0) {
      localStorage.setItem('sikat_disasters', JSON.stringify(disasters));
    }
  }, [disasters]);

  const handleFormSubmit = (data: any) => {
    const newDisaster = {
      ...data,
      id: disasters.length + 1,
    };
    setDisasters([newDisaster, ...disasters]);
    setShowInputForm(false);
  };

  const stats = {
    totalReports: disasters.length,
    banjir: disasters.filter(d => d.type === 'Banjir').length,
    longsor: disasters.filter(d => d.type === 'Longsor').length,
    verified: disasters.filter(d => d.verified).length
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen">
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-linear-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 block">SIKAT</span>
              <span className="text-xs text-gray-500">Dashboard</span>
            </div>
          </Link>
        </div>
        
        <nav className="p-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-red-600 bg-red-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Peta Bencana
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Laporan
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Statistik
          </a>
        </nav>
        
        {/* Spacer to push content up */}
        <div className="flex-1"></div>
        
        <div className="p-4 border-t border-gray-200 mt-auto">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Kebencanaan</h1>
              <p className="text-gray-500 mt-1">Pemantauan Banjir & Longsor - Wilayah Sumatera</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              <button 
                onClick={() => setShowInputForm(!showInputForm)}
                className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg shadow-red-600/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Laporan
              </button>
            </div>
          </div>
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
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.banjir}</div>
              <div className="text-gray-500 font-medium">Banjir</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Mountain className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.longsor}</div>
              <div className="text-gray-500 font-medium">Longsor</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.verified}</div>
              <div className="text-gray-500 font-medium">Terverifikasi</div>
            </div>
          </div>

          {/* Map and Detail Section */}
          <div className="grid grid-cols-3 gap-6">
            {/* Map */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Peta Sebaran Banjir & Longsor</h2>
                    <p className="text-sm text-gray-500 mt-1">Wilayah Sumatera - Monitoring Real-time</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-150">
                <MapComponent 
                  key="dashboard-map"
                  selectedDisaster={selectedDisaster} 
                  onDisasterSelect={setSelectedDisaster}
                  disasters={disasters}
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
                      <h3 className="font-bold text-lg">{selectedDisaster?.type || 'Bencana'}</h3>
                    </div>
                    <p className="text-red-100 text-sm">{selectedDisaster?.namaObjek}</p>
                  </div>
                  
                  <div className="p-6 space-y-4">
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
                          <div className="text-gray-600">{selectedDisaster?.timestamp}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Keterangan Kerusakan</div>
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
                        <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Status</div>
                          {selectedDisaster?.verified ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium mt-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Terverifikasi
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
                      <button className="w-full px-4 py-2.5 bg-linear-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all">
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
                          <div className="font-medium text-gray-900 text-sm">{disaster.type || 'Bencana'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{disaster.namaObjek}</div>
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
    </div>
  );
}
