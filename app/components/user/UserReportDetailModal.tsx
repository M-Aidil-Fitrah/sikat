"use client";

import { 
  X, 
  User, 
  MapPin, 
  Clock, 
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import type { DisasterData } from '@/lib/types';

interface UserReportDetailModalProps {
  disaster: DisasterData;
  onClose: () => void;
  onOpenInvalidReportForm: () => void;
  reportInvalidReports: Array<{
    id: string;
    reason: string;
    reporterName: string | null;
    createdAt: string;
  }>;
  loadingInvalidReports: boolean;
  onPhotoClick: (url: string) => void;
}

export default function UserReportDetailModal({ 
  disaster, 
  onClose, 
  onOpenInvalidReportForm,
  reportInvalidReports,
  loadingInvalidReports,
  onPhotoClick
}: UserReportDetailModalProps) {
  const formatDetailedTime = (timestamp: string, dateString: Date | string): string => {
    const date = new Date(dateString);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const day = date.getUTCDate();
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    
    return `${timestamp} (${day} ${month} ${year}, ${hours}:${minutes} WIB)`;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Image/Gradient */}
        <div className="relative h-48 shrink-0">
          {disaster.fotoLokasi && disaster.fotoLokasi.length > 0 ? (
            <div className="absolute inset-0">
              <img 
                src={disaster.fotoLokasi[0]} 
                alt={disaster.namaObjek}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          ) : (
            <div className="h-full bg-linear-to-r from-red-600 to-orange-500"></div>
          )}
          
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors z-10 touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                disaster.tingkatKerusakan === 'Berat' ? 'bg-red-500/90 text-white' :
                disaster.tingkatKerusakan === 'Sedang' ? 'bg-amber-500/90 text-white' :
                'bg-green-500/90 text-white'
              }`}>
                Kerusakan {disaster.tingkatKerusakan}
              </span>
              {disaster.invalidReportsCount && disaster.invalidReportsCount > 3 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/90 text-white rounded-full text-xs font-semibold mb-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Perlu Diverifikasi ({disaster.invalidReportsCount} laporan tidak valid)
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold drop-shadow-lg wrap-break-word">{disaster.namaObjek}</h2>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Photo Gallery */}
          {disaster.fotoLokasi && disaster.fotoLokasi.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Foto Dokumentasi</h3>
              <div className="grid grid-cols-4 gap-2">
                {disaster.fotoLokasi.map((foto, idx) => (
                  <button
                    key={idx}
                    onClick={() => onPhotoClick(foto)}
                    className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                  >
                    <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Lokasi</span>
              </div>
              <p className="text-gray-900 font-medium wrap-break-word">{disaster.desaKecamatan}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Waktu Lapor</span>
              </div>
              <p className="text-gray-900 font-medium text-sm">
                {formatDetailedTime(disaster.timestamp, disaster.submittedAt)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Jenis Kerusakan</span>
              </div>
              <p className="text-gray-900 font-medium wrap-break-word">{disaster.jenisKerusakan}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <User className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Pelapor</span>
              </div>
              <p className="text-gray-900 font-medium wrap-break-word">{disaster.namaPelapor}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium uppercase tracking-wider">Status Penanganan</span>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                disaster.statusTangani === 'SUDAH_DITANGANI' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {disaster.statusTangani === 'SUDAH_DITANGANI' ? 'Sudah Ditangani' : 'Belum Ditangani'}
              </span>
            </div>
          </div>

          {/* Keterangan */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Keterangan Kerusakan</h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 wrap-break-word whitespace-normal">
              {disaster.keteranganKerusakan}
            </p>
          </div>

          {/* Coordinates */}
          <div className="bg-gray-100 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Koordinat</span>
                <p className="font-mono text-sm mt-1 text-gray-800">{disaster.lat.toFixed(6)}, {disaster.lng.toFixed(6)}</p>
              </div>
            </div>
          </div>

          {/* Laporan Tidak Valid Section */}
          {disaster.invalidReportsCount && disaster.invalidReportsCount > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Laporan Tidak Valid ({disaster.invalidReportsCount})
              </h3>
              {loadingInvalidReports ? (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500">Memuat...</p>
                </div>
              ) : reportInvalidReports.length > 0 ? (
                <div className="space-y-3">
                  {reportInvalidReports.map((ir) => (
                    <div key={ir.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold text-amber-700">
                          {ir.reporterName || 'Anonim'}
                        </span>
                        <span className="text-xs text-amber-600">
                          {(() => {
                            const date = new Date(ir.createdAt);
                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                            return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
                          })()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {ir.reason}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500">Tidak ada detail tersedia</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onOpenInvalidReportForm}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Laporkan Tidak Valid
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
