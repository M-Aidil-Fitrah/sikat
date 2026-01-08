"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { DisasterData } from "@/lib/types";
import { getAllReports } from "@/lib/api";
import Pagination from "@/app/components/ui/Pagination";
import { 
  MapPin, 
  User, 
  AlertTriangle, 
  Search, 
  Map as MapIcon,
  X,
  RefreshCw,
  Eye,
  Clock,
  Building2,
  FileText as FileIcon,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";

// Format date - langsung dari database (sudah WIB)
const formatFullDate = (dateString: Date | string): string => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

type SortField = 'id' | 'submittedAt' | 'tingkatKerusakan' | 'namaObjek';
type SortOrder = 'asc' | 'desc';

export default function LaporanView() {
  const router = useRouter();
  
  const [reports, setReports] = useState<DisasterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("submittedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  // Detail modal
  const [selectedReport, setSelectedReport] = useState<DisasterData | null>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load reports
  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllReports();
      // Show all reports (not just approved)
      setReports(data);
    } catch (err) {
      console.error("Error loading reports:", err);
      setError("Gagal memuat data laporan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Toggle sort
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Apply filters and sorting
  const filteredReports = useMemo(() => {
    let result = [...reports];
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        r =>
          r.namaObjek.toLowerCase().includes(query) ||
          r.desaKecamatan.toLowerCase().includes(query) ||
          r.jenisKerusakan.toLowerCase().includes(query) ||
          r.namaPelapor.toLowerCase().includes(query) ||
          r.keteranganKerusakan.toLowerCase().includes(query) ||
          r.id.toString().includes(query)
      );
    }
    
    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'submittedAt':
          comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
          break;
        case 'tingkatKerusakan': {
          const order = { 'Berat': 3, 'Sedang': 2, 'Ringan': 1 };
          comparison = (order[a.tingkatKerusakan as keyof typeof order] || 0) - (order[b.tingkatKerusakan as keyof typeof order] || 0);
          break;
        }
        case 'namaObjek':
          comparison = a.namaObjek.localeCompare(b.namaObjek);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [reports, searchQuery, sortField, sortOrder]);

  // Paginated reports
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReports, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  // Navigate to dashboard with coordinates
  const viewOnMap = (report: DisasterData) => {
    router.push(`/dashboard?lat=${report.lat}&lng=${report.lng}&id=${report.id}`);
  };

  // Stats
  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter(r => r.status === "PENDING").length,
    approved: reports.filter(r => r.status === "APPROVED").length,
    rejected: reports.filter(r => r.status === "REJECTED").length,
  }), [reports]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Berat":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          badge: "bg-red-100 text-red-700",
          dot: "bg-red-500",
        };
      case "Sedang":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          badge: "bg-amber-100 text-amber-700",
          dot: "bg-amber-500",
        };
      default:
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          badge: "bg-emerald-100 text-emerald-700",
          dot: "bg-emerald-500",
        };
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-red-600" /> : <ArrowDown className="w-3.5 h-3.5 text-red-600" />;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header - scrolls with content */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Daftar Laporan</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Semua laporan bencana
              </p>
            </div>
            <button 
              onClick={loadReports}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all shadow-sm font-medium text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Memuat..." : "Refresh"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-500 font-medium">Total Laporan</div>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
              <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
              <div className="text-xs text-amber-600 font-medium">Menunggu</div>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-100 p-4">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-xs text-green-600 font-medium">Terverifikasi</div>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-100 p-4">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-xs text-red-600 font-medium">Ditolak</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama objek, lokasi, jenis kerusakan, pelapor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && reports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-3 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Memuat data laporan...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <h3 className="font-semibold text-red-900 mb-1">Gagal Memuat Data</h3>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button 
                onClick={loadReports}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredReports.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileIcon className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {searchQuery ? "Tidak ada hasil" : "Belum ada laporan"}
              </h3>
              <p className="text-gray-500 text-sm">
                {searchQuery 
                  ? "Coba ubah kata kunci pencarian"
                  : "Laporan yang telah diverifikasi akan muncul di sini"
                }
              </p>
            </div>
          )}

          {/* Table */}
          {!isLoading && !error && filteredReports.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4">
                        <button 
                          onClick={() => toggleSort('id')}
                          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                        >
                          ID <SortIcon field="id" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">
                        <button 
                          onClick={() => toggleSort('namaObjek')}
                          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                        >
                          Nama Objek <SortIcon field="namaObjek" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 hidden md:table-cell">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Lokasi</span>
                      </th>
                      <th className="text-left py-3 px-4">
                        <button 
                          onClick={() => toggleSort('tingkatKerusakan')}
                          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                        >
                          Tingkat <SortIcon field="tingkatKerusakan" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</span>
                      </th>
                      <th className="text-left py-3 px-4 hidden lg:table-cell">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pelapor</span>
                      </th>
                      <th className="text-left py-3 px-4">
                        <button 
                          onClick={() => toggleSort('submittedAt')}
                          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                        >
                          Waktu <SortIcon field="submittedAt" />
                        </button>
                      </th>
                      <th className="text-center py-3 px-4">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedReports.map((report) => {
                      const colors = getSeverityColor(report.tingkatKerusakan);
                      return (
                        <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              #{report.id}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {report.fotoLokasi && report.fotoLokasi.length > 0 ? (
                                <img
                                  src={report.fotoLokasi[0]}
                                  alt={report.namaObjek}
                                  className="w-10 h-10 rounded-lg object-cover shrink-0 hidden sm:block"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/40?text=N";
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center shrink-0 hidden sm:flex">
                                  <Building2 className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate max-w-32" title={report.namaObjek}>
                                  {report.namaObjek.length > 20 ? `${report.namaObjek.slice(0, 20)}...` : report.namaObjek}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{report.jenisKerusakan}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate max-w-40">{report.desaKecamatan}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
                              {report.tingkatKerusakan}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              report.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                              report.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {report.status === 'PENDING' ? 'Menunggu' : report.status === 'APPROVED' ? 'Terverifikasi' : 'Ditolak'}
                            </span>
                          </td>
                          <td className="py-3 px-4 hidden lg:table-cell">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate max-w-24">{report.namaPelapor}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span className="whitespace-nowrap">{formatFullDate(report.submittedAt)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setSelectedReport(report)}
                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => viewOnMap(report)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Lihat di Peta"
                              >
                                <MapIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredReports.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedReport(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative">
              {selectedReport.fotoLokasi && selectedReport.fotoLokasi.length > 0 ? (
                <div className="h-48 relative">
                  <img
                    src={selectedReport.fotoLokasi[0]}
                    alt={selectedReport.namaObjek}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
              ) : (
                <div className="h-32 bg-linear-to-r from-red-600 to-orange-500"></div>
              )}
              
              <button
                onClick={() => setSelectedReport(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getSeverityColor(selectedReport.tingkatKerusakan).badge} mb-2`}>
                  Kerusakan {selectedReport.tingkatKerusakan}
                </span>
                <h2 className="text-xl font-bold drop-shadow-lg">{selectedReport.namaObjek}</h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 max-h-[calc(90vh-12rem)] overflow-y-auto">
              {/* Photo Gallery */}
              {selectedReport.fotoLokasi && selectedReport.fotoLokasi.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Foto Dokumentasi</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedReport.fotoLokasi.map((foto, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPhotoUrl(foto)}
                        className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium uppercase">Lokasi</span>
                  </div>
                  <p className="text-gray-900 text-sm font-medium">{selectedReport.desaKecamatan}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium uppercase">Waktu</span>
                  </div>
                  <p className="text-gray-900 text-sm font-medium">{formatFullDate(selectedReport.submittedAt)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium uppercase">Jenis</span>
                  </div>
                  <p className="text-gray-900 text-sm font-medium">{selectedReport.jenisKerusakan}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium uppercase">Pelapor</span>
                  </div>
                  <p className="text-gray-900 text-sm font-medium">{selectedReport.namaPelapor}</p>
                </div>
              </div>

              {/* Status Penanganan */}
              <div className={`rounded-lg p-3 mb-5 ${
                selectedReport.statusTangani === 'SUDAH_DITANGANI' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                <span className={`text-xs font-semibold uppercase ${
                  selectedReport.statusTangani === 'SUDAH_DITANGANI' ? 'text-green-700' : 'text-amber-700'
                }`}>Status Penanganan</span>
                <p className={`font-medium text-sm mt-0.5 ${
                  selectedReport.statusTangani === 'SUDAH_DITANGANI' ? 'text-green-900' : 'text-amber-900'
                }`}>
                  {selectedReport.statusTangani === 'SUDAH_DITANGANI' ? 'Sudah Ditangani' : 'Belum Ditangani'}
                </p>
              </div>

              {/* Keterangan */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Keterangan</h3>
                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg p-3">
                  {selectedReport.keteranganKerusakan}
                </p>
              </div>

              {/* Coordinates & Actions */}
              <div className="bg-gray-900 rounded-lg p-3 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 uppercase">Koordinat</span>
                  <p className="font-mono text-sm mt-0.5">{selectedReport.lat.toFixed(6)}, {selectedReport.lng.toFixed(6)}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    viewOnMap(selectedReport);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                >
                  <MapIcon className="w-4 h-4" />
                  Peta
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <span className="text-xs text-gray-400">ID: #{selectedReport.id}</span>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
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
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-60"
          onClick={() => setSelectedPhotoUrl(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            onClick={() => setSelectedPhotoUrl(null)}
          >
            <X className="w-5 h-5" />
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
