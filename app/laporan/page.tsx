"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import type { DisasterData } from "@/lib/types";
import { getReports } from "@/lib/api";
import { 
  MapPin, 
  User, 
  AlertTriangle, 
  Search, 
  Map as MapIcon,
  ArrowUpDown,
  X,
  RefreshCw,
  Eye,
  ChevronDown,
  Clock,
  Building2,
  FileText as FileIcon,
  Menu
} from "lucide-react";

// Format date - langsung dari database (sudah WIB)
const formatFullDate = (dateString: Date | string): string => {
  const date = new Date(dateString);
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  // Gunakan UTC methods untuk membaca waktu yang sudah dalam WIB dari database
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
};

type SortOption = 'newest' | 'oldest' | 'severity-high' | 'severity-medium' | 'severity-low';

function LaporanContent() {
  const router = useRouter();
  
  const [reports, setReports] = useState<DisasterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  
  // Detail modal
  const [selectedReport, setSelectedReport] = useState<DisasterData | null>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  // Load sidebar state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setSidebarCollapsed(saved === "true");
    }
    
    // Listen for sidebar changes
    const handleStorageChange = () => {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved !== null) {
        setSidebarCollapsed(saved === "true");
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also check periodically (for same-tab changes)
    const interval = setInterval(handleStorageChange, 100);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Load reports
  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getReports();
      // Filter only approved reports
      const approvedReports = data.filter(r => r.status === "APPROVED");
      setReports(approvedReports);
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
          r.keteranganKerusakan.toLowerCase().includes(query)
      );
    }
    
    // Exclusive severity filter - only show selected severity
    if (sortBy === "severity-high") {
      result = result.filter(r => r.tingkatKerusakan === "Berat");
    } else if (sortBy === "severity-medium") {
      result = result.filter(r => r.tingkatKerusakan === "Sedang");
    } else if (sortBy === "severity-low") {
      result = result.filter(r => r.tingkatKerusakan === "Ringan");
    }
    
    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
        case "severity-high":
        case "severity-medium":
        case "severity-low":
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        case "oldest":
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        default:
          return 0;
      }
    });
    
    return result;
  }, [reports, searchQuery, sortBy]);

  // Navigate to dashboard with coordinates
  const viewOnMap = (report: DisasterData) => {
    router.push(`/dashboard?lat=${report.lat}&lng=${report.lng}&id=${report.id}`);
  };

  // Stats
  const stats = useMemo(() => ({
    total: reports.length,
    berat: reports.filter(r => r.tingkatKerusakan === "Berat").length,
    sedang: reports.filter(r => r.tingkatKerusakan === "Sedang").length,
    ringan: reports.filter(r => r.tingkatKerusakan === "Ringan").length,
  }), [reports]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Berat":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          dot: "bg-red-500",
          badge: "bg-red-100 text-red-700",
        };
      case "Sedang":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          dot: "bg-amber-500",
          badge: "bg-amber-100 text-amber-700",
        };
      default:
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          dot: "bg-emerald-500",
          badge: "bg-emerald-100 text-emerald-700",
        };
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery || sortBy !== "newest";

  return (
    <div className="min-h-screen bg-gray-50/80 flex">
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Content */}
      <main 
        className={`flex-1 min-h-screen transition-all duration-300 lg:${
          sidebarCollapsed ? "ml-20" : "ml-72"
        }`}
      >
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/80 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Daftar Laporan</h1>
                  <p className="text-gray-500 mt-1 text-sm">
                    Laporan bencana yang telah diverifikasi
                  </p>
                </div>
                {/* Hamburger Menu - Mobile Only */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                  aria-label="Toggle menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button 
                  onClick={loadReports}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all shadow-sm font-medium text-sm w-full sm:w-auto justify-center"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                  <span>{isLoading ? "Memuat..." : "Refresh"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Search & Filters Bar */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-sm mb-4 sm:mb-6 overflow-visible">
              <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari laporan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 sm:pl-11 pr-4 py-2.5 sm:py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all placeholder:text-gray-400"
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

                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      showFilters || sortBy !== "newest"
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    <span>Urutkan</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </button>

                  {showFilters && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50">
                      {[
                        { value: "newest", label: "Terbaru" },
                        { value: "oldest", label: "Terlama" },
                        { value: "severity-high", label: `Kerusakan Berat (${stats.berat})` },
                        { value: "severity-medium", label: `Kerusakan Sedang (${stats.sedang})` },
                        { value: "severity-low", label: `Kerusakan Ringan (${stats.ringan})` },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value as SortOption);
                            setShowFilters(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                            sortBy === option.value
                              ? "bg-gray-100 text-gray-900 font-medium"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reset
                  </button>
                )}
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="px-4 pb-4 flex items-center gap-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Filter aktif:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                      Pencarian: &quot;{searchQuery}&quot;
                      <button onClick={() => setSearchQuery("")}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {sortBy !== "newest" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                      {sortBy === "oldest" ? "Terlama" : 
                       sortBy === "severity-high" ? "Kerusakan Berat" : 
                       sortBy === "severity-medium" ? "Kerusakan Sedang" :
                       "Kerusakan Ringan"}
                      <button onClick={() => setSortBy("newest")}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
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
              <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="font-semibold text-red-900 mb-2">Gagal Memuat Data</h3>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button 
                  onClick={loadReports}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredReports.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {hasActiveFilters ? "Tidak ada hasil" : "Belum ada laporan"}
                </h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  {hasActiveFilters 
                    ? "Coba ubah filter atau kata kunci pencarian Anda"
                    : "Laporan yang telah diverifikasi akan muncul di sini"
                  }
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            )}

            {/* Reports Grid */}
            {!isLoading && !error && filteredReports.length > 0 && (
              <div className="space-y-4">
                {/* Results count */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Menampilkan <span className="font-semibold text-gray-900">{filteredReports.length}</span> laporan
                  </p>
                </div>

                {/* Reports List */}
                <div className="grid gap-4">
                  {filteredReports.map((report) => {
                    const colors = getSeverityColor(report.tingkatKerusakan);
                    
                    return (
                      <div
                        key={report.id}
                        className="group bg-white rounded-xl sm:rounded-2xl border border-gray-200/80 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        <div className="flex flex-col sm:flex-row">
                          {/* Image Section */}
                          {report.fotoLokasi && report.fotoLokasi.length > 0 ? (
                            <div className="w-full sm:w-48 h-32 sm:h-40 relative shrink-0 overflow-hidden bg-gray-100">
                              <img
                                src={report.fotoLokasi[0]}
                                alt={report.namaObjek}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/200x150?text=No+Image";
                                }}
                              />
                              {report.fotoLokasi.length > 1 && (
                                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                                  +{report.fotoLokasi.length - 1}
                                </div>
                              )}
                              {/* Severity indicator on image */}
                              <div className={`absolute top-3 left-3 w-3 h-3 ${colors.dot} rounded-full ring-2 ring-white shadow-lg`}></div>
                            </div>
                          ) : (
                            <div className="w-full sm:w-48 h-32 sm:h-40 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
                              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
                            </div>
                          )}

                          {/* Content Section */}
                          <div className="flex-1 p-3 sm:p-5 flex flex-col">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors.badge}`}>
                                    {report.tingkatKerusakan}
                                  </span>
                                  <span className="text-xs text-gray-400">{report.timestamp}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate group-hover:text-red-600 transition-colors">
                                  {report.namaObjek}
                                </h3>
                              </div>
                            </div>

                            <div className="space-y-1.5 sm:space-y-2 flex-1">
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                                <span className="truncate">{report.desaKecamatan}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 text-gray-400" />
                                <span className="truncate">{report.jenisKerusakan}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                                <span className="truncate">{report.namaPelapor}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                              <button
                                onClick={() => setSelectedReport(report)}
                                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Detail
                              </button>
                              <button
                                onClick={() => viewOnMap(report)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                              >
                                <MapIcon className="w-4 h-4" />
                                Lihat di Peta
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedReport && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedReport(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative">
              {selectedReport.fotoLokasi && selectedReport.fotoLokasi.length > 0 ? (
                <div className="h-56 relative">
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

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(selectedReport.tingkatKerusakan).badge} mb-2`}>
                  Kerusakan {selectedReport.tingkatKerusakan}
                </span>
                <h2 className="text-2xl font-bold drop-shadow-lg">{selectedReport.namaObjek}</h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[calc(90vh-14rem)] overflow-y-auto">
              {/* Photo Gallery */}
              {selectedReport.fotoLokasi && selectedReport.fotoLokasi.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Foto Dokumentasi</h3>
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
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Lokasi</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedReport.desaKecamatan}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Waktu Lapor</span>
                  </div>
                  <p className="text-gray-900 font-medium">{formatFullDate(selectedReport.submittedAt)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Jenis Kerusakan</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedReport.jenisKerusakan}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Pelapor</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedReport.namaPelapor}</p>
                </div>
                <div className={`rounded-xl p-4 col-span-2 ${
                  selectedReport.statusTangani === 'SUDAH_DITANGANI' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-amber-50 border border-amber-200'
                }`}>
                  <div className={`flex items-center gap-2 mb-1 ${
                    selectedReport.statusTangani === 'SUDAH_DITANGANI' ? 'text-green-700' : 'text-amber-700'
                  }`}>
                    {selectedReport.statusTangani === 'SUDAH_DITANGANI' ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span className="text-xs font-medium uppercase tracking-wider">Status Penanganan</span>
                  </div>
                  <p className={`font-semibold ${
                    selectedReport.statusTangani === 'SUDAH_DITANGANI' ? 'text-green-900' : 'text-amber-900'
                  }`}>
                    {selectedReport.statusTangani === 'SUDAH_DITANGANI' ? 'Sudah Ditangani' : 'Belum Ditangani'}
                  </p>
                </div>
              </div>

              {/* Keterangan */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Keterangan Kerusakan</h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
                  {selectedReport.keteranganKerusakan}
                </p>
              </div>

              {/* Coordinates */}
              <div className="bg-gray-900 rounded-xl p-4 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Koordinat</span>
                    <p className="font-mono text-sm mt-1">{selectedReport.lat.toFixed(6)}, {selectedReport.lng.toFixed(6)}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedReport(null);
                      viewOnMap(selectedReport);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                  >
                    <MapIcon className="w-4 h-4" />
                    Buka di Peta
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">ID: #{selectedReport.id}</span>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors"
                >
                  Tutup
                </button>
              </div>
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
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
            onClick={() => setSelectedPhotoUrl(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={selectedPhotoUrl} 
            alt="Full view" 
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Click outside to close filter dropdown */}
      {showFilters && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}

// Main export with Suspense boundary
export default function LaporanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Memuat laporan...</p>
        </div>
      </div>
    }>
      <LaporanContent />
    </Suspense>
  );
}
