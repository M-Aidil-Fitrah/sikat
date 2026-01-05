"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import * as XLSX from 'xlsx';

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle,
  FileText,
  Loader2,
  X,
  Filter,
  ChevronRight,
  Download,
  Menu
} from 'lucide-react';

interface Report {
  id: number;
  namaPelapor: string;
  kontak: string;
  desaKecamatan: string;
  namaObjek: string;
  jenisKerusakan: string;
  tingkatKerusakan: string;
  keteranganKerusakan: string;
  lat: number;
  lng: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  fotoLokasi: string[];
  submittedAt: string;
  createdAt: string;
}

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function AdminDashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

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

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      
      if (response.status === 401) {
        router.push('/superuser');
        return;
      }
      
      if (response.ok) {
        setIsAuthenticated(true);
        // Load reports after auth check succeeds
        loadReports();
      } else {
        router.push('/superuser');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/superuser');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Filter reports berdasarkan status
  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter(r => r.status === statusFilter));
    }
  }, [statusFilter, reports]);

  const loadReports = async () => {
    try {
      console.log('Loading reports from API...');
      const response = await fetch('/api/admin/reports');
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized - redirecting to login');
          router.push('/superuser');
          return;
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'Gagal memuat laporan');
      }

      const data = await response.json();
      console.log('Loaded data:', data);
      
      // API returns { success: true, reports: [...], stats: {...} }
      if (data.success && data.reports && Array.isArray(data.reports)) {
        console.log(`Successfully loaded ${data.reports.length} reports`);
        setReports(data.reports);
      } else {
        console.error('Invalid data format:', data);
        setReports([]);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      alert('Gagal memuat laporan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (reportId: number, newStatus: 'APPROVED' | 'REJECTED') => {
    setIsUpdating(reportId);
    try {
      console.log('Updating report:', reportId, 'to status:', newStatus);
      
      const response = await fetch(`/api/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log('Update response status:', response.status);
      
      const data = await response.json();
      console.log('Update response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengupdate status');
      }

      // Show success message
      alert(`Laporan berhasil ${newStatus === 'APPROVED' ? 'disetujui' : 'ditolak'}!`);
      
      // Reload data
      await loadReports();
      setShowDetailModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Gagal mengupdate status laporan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/superuser');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const openDetail = (report: Report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  // Download reports as Excel
  const downloadExcel = () => {
    // Prepare data for Excel
    const excelData = filteredReports.map((report, index) => ({
      'No': index + 1,
      'ID': report.id,
      'Nama Objek': report.namaObjek,
      'Jenis Kerusakan': report.jenisKerusakan,
      'Tingkat Kerusakan': report.tingkatKerusakan,
      'Lokasi (Desa/Kecamatan)': report.desaKecamatan,
      'Koordinat Latitude': report.lat,
      'Koordinat Longitude': report.lng,
      'Nama Pelapor': report.namaPelapor,
      'Kontak': report.kontak,
      'Keterangan': report.keteranganKerusakan,
      'Status': report.status === 'PENDING' ? 'Menunggu' : report.status === 'APPROVED' ? 'Disetujui' : 'Ditolak',
      'Tanggal Lapor': (() => {
        const date = new Date(report.submittedAt || report.createdAt);
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const day = date.getUTCDate();
        const month = months[date.getUTCMonth()];
        const year = date.getUTCFullYear();
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
      })(),
      'Jumlah Foto': report.fotoLokasi?.length || 0
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 5 },  // No
      { wch: 8 },  // ID
      { wch: 30 }, // Nama Objek
      { wch: 20 }, // Jenis Kerusakan
      { wch: 18 }, // Tingkat Kerusakan
      { wch: 30 }, // Lokasi
      { wch: 15 }, // Latitude
      { wch: 15 }, // Longitude
      { wch: 25 }, // Nama Pelapor
      { wch: 15 }, // Kontak
      { wch: 50 }, // Keterangan
      { wch: 12 }, // Status
      { wch: 30 }, // Tanggal
      { wch: 12 }  // Jumlah Foto
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Bencana');

    // Generate filename with current date
    const today = new Date();
    const filename = `Laporan_Bencana_${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  // Statistik
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'PENDING').length,
    approved: reports.filter(r => r.status === 'APPROVED').length,
    rejected: reports.filter(r => r.status === 'REJECTED').length,
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar 
        isAdmin={true}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}`}>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex justify-between items-start sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Dashboard Admin</h1>
                <p className="text-gray-500 mt-1 text-sm">Kelola dan verifikasi laporan bencana alam</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={downloadExcel}
                  disabled={filteredReports.length === 0}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-linear-to-r from-red-600 to-orange-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-base font-semibold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg shadow-orange-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Download Excel</span>
                  <span className="sm:hidden">Excel</span>
                </button>
                
                {/* Hamburger Menu - Mobile Only */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Toggle menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Wrapper */}
          <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </div>
                <span className="text-xs sm:text-sm text-gray-500">Total</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
              <p className="text-xs sm:text-sm text-gray-600">Total Laporan</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-yellow-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
                <span className="text-xs sm:text-sm text-yellow-700">Total</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">{stats.pending}</p>
              <p className="text-xs sm:text-sm text-gray-600">Menunggu Verifikasi</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-green-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <span className="text-xs sm:text-sm text-green-700">Total</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{stats.approved}</p>
              <p className="text-xs sm:text-sm text-gray-600">Disetujui</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-red-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <span className="text-xs sm:text-sm text-red-700">Total</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">{stats.rejected}</p>
              <p className="text-xs sm:text-sm text-gray-600">Ditolak</p>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="text-xs sm:text-sm font-semibold text-gray-700">Filter Status:</span>
              </div>
              <div className="flex gap-2 flex-1 flex-wrap">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as StatusFilter[]).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      statusFilter === status
                        ? 'bg-linear-to-r from-red-600 to-orange-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'ALL' ? 'Semua' : status === 'PENDING' ? 'Menunggu' : status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Daftar Laporan</h2>
            </div>

            {filteredReports.length === 0 ? (
              <div className="p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada laporan dengan status ini</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredReports.map(report => (
                  <div
                    key={report.id}
                    onClick={() => openDetail(report)}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Status Indicator */}
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          report.status === 'PENDING' ? 'bg-yellow-500' :
                          report.status === 'APPROVED' ? 'bg-green-500' :
                          'bg-red-500'
                        }`} />

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                              {report.namaObjek}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                              report.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {report.status === 'PENDING' ? 'Menunggu' : report.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2">
                            <span className="flex items-center gap-1 truncate">
                              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                              <span className="truncate">{report.namaPelapor}</span>
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                              <span className="truncate">{report.desaKecamatan}</span>
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                              <span className="truncate">{new Date(report.submittedAt || report.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-700">
                              {report.jenisKerusakan}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                              report.tingkatKerusakan === 'Ringan' || report.tingkatKerusakan === 'RINGAN' ? 'bg-green-100 text-green-700' :
                              report.tingkatKerusakan === 'Sedang' || report.tingkatKerusakan === 'SEDANG' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {report.tingkatKerusakan}
                            </span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header with Image/Gradient */}
            <div className="relative h-48 shrink-0">
              {selectedReport.fotoLokasi && selectedReport.fotoLokasi.length > 0 ? (
                <div className="absolute inset-0">
                  <img 
                    src={selectedReport.fotoLokasi[0]} 
                    alt={selectedReport.namaObjek}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
              ) : (
                <div className="h-full bg-linear-to-r from-red-600 to-orange-500"></div>
              )}
              
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                  selectedReport.tingkatKerusakan === 'BERAT' || selectedReport.tingkatKerusakan === 'Berat' ? 'bg-red-500/90 text-white' :
                  selectedReport.tingkatKerusakan === 'SEDANG' || selectedReport.tingkatKerusakan === 'Sedang' ? 'bg-amber-500/90 text-white' :
                  'bg-green-500/90 text-white'
                }`}>
                  Kerusakan {selectedReport.tingkatKerusakan}
                </span>
                <h2 className="text-2xl font-bold drop-shadow-lg">{selectedReport.namaObjek}</h2>
                <p className="text-white/90 text-sm mt-1">ID: #{selectedReport.id}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  selectedReport.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  selectedReport.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedReport.status === 'PENDING' ? 'Menunggu Verifikasi' : 
                   selectedReport.status === 'APPROVED' ? '✓ Disetujui' : '✗ Ditolak'}
                </span>
              </div>

              {/* Photo Gallery */}
              {selectedReport.fotoLokasi && selectedReport.fotoLokasi.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Foto Dokumentasi</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedReport.fotoLokasi.map((foto, idx) => (
                      <button
                        key={idx}
                        onClick={() => window.open(foto, '_blank')}
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
                    <User className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Pelapor</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedReport.namaPelapor}</p>
                  <p className="text-gray-500 text-sm">{selectedReport.kontak}</p>
                </div>
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
                  <p className="text-gray-900 font-medium text-sm">
                    {(() => {
                      const date = new Date(selectedReport.submittedAt || selectedReport.createdAt);
                      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                      const day = date.getUTCDate();
                      const month = months[date.getUTCMonth()];
                      const year = date.getUTCFullYear();
                      const hours = date.getUTCHours().toString().padStart(2, '0');
                      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                      return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
                    })()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Jenis Kerusakan</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedReport.jenisKerusakan}</p>
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
                </div>
              </div>

              {/* Actions - Only for PENDING */}
              {selectedReport.status === 'PENDING' && (
                <div className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                  <button
                    onClick={() => updateStatus(selectedReport.id, 'APPROVED')}
                    disabled={isUpdating === selectedReport.id}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating === selectedReport.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    Setujui Laporan
                  </button>
                  <button
                    onClick={() => updateStatus(selectedReport.id, 'REJECTED')}
                    disabled={isUpdating === selectedReport.id}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-red-600 to-rose-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating === selectedReport.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    Tolak Laporan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
