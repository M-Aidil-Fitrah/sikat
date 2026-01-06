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
  Menu,
  RefreshCw,
  AlertCircle,
  Eye,
  ChevronUp
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
  lat?: number;
  lng?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  statusTangani: 'SUDAH_DITANGANI' | 'BELUM_DITANGANI';
  fotoLokasi: string[];
  submittedAt: string;
  createdAt: string;
  reviewedAt?: string | null;
  reviewedBy?: {
    id: number;
    name: string;
    username: string;
  } | null;
  invalidReportsCount?: number;
}

interface InvalidReportData {
  id: string;
  reportId: number;
  reason: string;
  reporterName: string | null;
  kontak: string | null;
  createdAt: string;
  report: Report;
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
  const [showInvalidReports, setShowInvalidReports] = useState(false);
  const [invalidReports, setInvalidReports] = useState<InvalidReportData[]>([]);
  const [isLoadingInvalidReports, setIsLoadingInvalidReports] = useState(false);
  const [selectedReportInvalidReports, setSelectedReportInvalidReports] = useState<Array<{
    id: string;
    reason: string;
    reporterName: string | null;
    kontak: string | null;
    createdAt: string;
  }>>([]);
  const [isLoadingSelectedInvalidReports, setIsLoadingSelectedInvalidReports] = useState(false);
  const [showInvalidReportsDetail, setShowInvalidReportsDetail] = useState(false);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto logout setelah 1 jam tidak ada aktivitas
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      // 1 jam = 3600000 ms
      inactivityTimer = setTimeout(async () => {
        console.log('Session timeout - logging out due to inactivity');
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error('Logout error:', error);
        }
        router.push('/superuser?error=inactivity');
      }, 3600000); // 1 hour
    };

    // Reset timer on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Start timer initially
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [router]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      
      if (response.status === 401) {
        // Redirect dengan pesan error session expired
        router.push('/superuser?error=session_expired');
        return;
      }
      
      if (response.ok) {
        setIsAuthenticated(true);
        // Load reports after auth check succeeds
        loadReports();
      } else {
        router.push('/superuser?error=session_expired');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/superuser?error=session_expired');
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

  useEffect(() => {
    if (showDetailModal && selectedReport && selectedReport.invalidReportsCount && selectedReport.invalidReportsCount > 0) {
      loadInvalidReportsForReport(selectedReport.id);
    }
  }, [showDetailModal, selectedReport]);

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

      // Load invalid reports bersamaan
      await loadInvalidReports();
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

  const updateStatusTangani = async (reportId: number, newStatusTangani: 'SUDAH_DITANGANI' | 'BELUM_DITANGANI') => {
    try {
      const currentReport = reports.find(r => r.id === reportId);
      if (!currentReport) return;

      const response = await fetch(`/api/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: currentReport.status,
          statusTangani: newStatusTangani 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengupdate status tangani');
      }

      // Show success message
      alert(`Status penanganan berhasil diubah menjadi ${newStatusTangani === 'SUDAH_DITANGANI' ? 'Sudah Ditangani' : 'Belum Ditangani'}!`);
      
      // Reload data
      await loadReports();
    } catch (error) {
      console.error('Error updating statusTangani:', error);
      alert(`Gagal mengupdate status penanganan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const openDetail = (report: Report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const loadInvalidReports = async () => {
    setIsLoadingInvalidReports(true);
    try {
      const response = await fetch('/api/invalid-reports');
      
      if (!response.ok) {
        throw new Error('Gagal memuat Laporan tidak valid');
      }

      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data)) {
        setInvalidReports(data.data);
      } else {
        setInvalidReports([]);
      }
    } catch (error) {
      console.error('Error loading invalid reports:', error);
      alert('Gagal memuat laporan tidak valid. Silakan coba lagi.');
    } finally {
      setIsLoadingInvalidReports(false);
    }
  };

  const toggleInvalidReports = () => {
    setShowInvalidReports(!showInvalidReports);
  };

  const loadInvalidReportsForReport = async (reportId: number) => {
    setIsLoadingSelectedInvalidReports(true);
    setShowInvalidReportsDetail(false); // Close detail saat mulai load baru
    try {
      const response = await fetch(`/api/invalid-reports/${reportId}`);
      
      if (!response.ok) {
        throw new Error('Gagal memuat laporan tidak valid');
      }

      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data)) {
        setSelectedReportInvalidReports(data.data);
      } else {
        setSelectedReportInvalidReports([]);
      }
    } catch (error) {
      console.error('Error loading invalid reports for report:', error);
      setSelectedReportInvalidReports([]);
    } finally {
      setIsLoadingSelectedInvalidReports(false);
    }
  };

  // Download reports as Excel
  const downloadExcel = () => {
    // Prepare data for Laporan Kebencanaan
    const excelData = filteredReports.map((report, index) => ({
      'No': index + 1,
      'ID': report.id,
      'Nama Objek': report.namaObjek,
      'Jenis Kerusakan': report.jenisKerusakan,
      'Tingkat Kerusakan': report.tingkatKerusakan,
      'Lokasi (Desa/Kecamatan)': report.desaKecamatan,
      'Koordinat Latitude': report.lat ?? 'N/A',
      'Koordinat Longitude': report.lng ?? 'N/A',
      'Nama Pelapor': report.namaPelapor,
      'Kontak': report.kontak,
      'Keterangan': report.keteranganKerusakan,
      'Status': report.status === 'PENDING' ? 'Menunggu' : report.status === 'APPROVED' ? 'Disetujui' : 'Ditolak',
      'Status Penanganan': report.statusTangani === 'SUDAH_DITANGANI' ? 'Sudah Ditangani' : 'Belum Ditangani',
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
      'Tanggal Review': report.reviewedAt ? (() => {
        const date = new Date(report.reviewedAt);
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const day = date.getUTCDate();
        const month = months[date.getUTCMonth()];
        const year = date.getUTCFullYear();
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
      })() : '-',
      'Direview Oleh': report.reviewedBy ? report.reviewedBy.name : '-',
      'Jumlah Foto': report.fotoLokasi?.length || 0
    }));

    // Prepare data for Laporan Tidak Valid
    const invalidReportsData = invalidReports.map((ir, index) => ({
      'No': index + 1,
      'ID Laporan Tidak Valid': ir.id,
      'ID Laporan': ir.reportId,
      'Nama Objek Laporan': ir.report?.namaObjek || 'N/A',
      'Alasan/Komentar': ir.reason,
      'Nama Pelapor': ir.reporterName || 'Anonim',
      'Kontak Pelapor': ir.kontak || '-',
      'Tanggal Lapor Tidak Valid': (() => {
        const date = new Date(ir.createdAt);
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const day = date.getUTCDate();
        const month = months[date.getUTCMonth()];
        const year = date.getUTCFullYear();
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
      })()
    }));

    // Create worksheet for Laporan Kebencanaan
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for Laporan Kebencanaan
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
      { wch: 20 }, // Status Penanganan
      { wch: 30 }, // Tanggal Lapor
      { wch: 30 }, // Tanggal Review
      { wch: 25 }, // Direview Oleh
      { wch: 12 }  // Jumlah Foto
    ];
    ws['!cols'] = colWidths;

    // Create worksheet for Laporan Tidak Valid
    const wsInvalid = XLSX.utils.json_to_sheet(invalidReportsData);

    // Set column widths for Laporan Tidak Valid
    const colWidthsInvalid = [
      { wch: 5 },  // No
      { wch: 25 }, // ID Laporan Tidak Valid
      { wch: 10 }, // ID Laporan
      { wch: 30 }, // Nama Objek Laporan
      { wch: 60 }, // Alasan/Komentar
      { wch: 25 }, // Nama Pelapor
      { wch: 15 }, // Kontak Pelapor
      { wch: 30 }  // Tanggal
    ];
    wsInvalid['!cols'] = colWidthsInvalid;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Kebencanaan');
    XLSX.utils.book_append_sheet(wb, wsInvalid, 'Laporan Tidak Valid');

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
                {/* Refresh Button */}
                <button
                  onClick={loadReports}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Refresh data"
                >
                  <RefreshCw className={`w-4 h-4 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                {/* Download Excel Button */}
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

          {/* Invalid Reports Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-amber-200 overflow-hidden mb-6 sm:mb-8">
            <button
              onClick={toggleInvalidReports}
              className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-amber-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Laporan Tidak Valid</h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {invalidReports.length} Laporan Tidak Valid dilaporkan oleh pengguna
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showInvalidReports ? 'rotate-90' : ''}`} />
            </button>

            {showInvalidReports && (
              <div className="border-t border-amber-100">
                {isLoadingInvalidReports ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">Memuat laporan tidak valid...</p>
                  </div>
                ) : invalidReports.length === 0 ? (
                  <div className="p-12 text-center">
                    <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Tidak ada laporan tidak valid</p>
                  </div>
                ) : (
                  <div className="divide-y divide-amber-100">
                    {invalidReports.map((invalid) => (
                      <div key={invalid.id} className="p-4 sm:p-5 hover:bg-amber-50 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded">
                                Laporan tidak valid #{invalid.id.substring(0, 8)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {(() => {
                                  const date = new Date(invalid.createdAt);
                                  const now = new Date();
                                  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
                                  if (diffHours < 1) return 'Baru saja';
                                  if (diffHours < 24) return `${diffHours} jam lalu`;
                                  return `${Math.floor(diffHours / 24)} hari lalu`;
                                })()}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              Laporan: {invalid.report.namaObjek}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              ID Laporan: #{invalid.reportId} • {invalid.report.desaKecamatan}
                            </p>
                          </div>
                        </div>

                        <div className="bg-amber-50 rounded-lg p-3 mb-3">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Alasan Laporan Tidak Valid:</p>
                          <p className="text-sm text-gray-900">{invalid.reason}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            <span>
                              Pelapor: {invalid.reporterName || 'Anonim'}
                            </span>
                          </div>
                          {invalid.kontak && (
                            <div className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span>Kontak: {invalid.kontak}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-amber-200">
                          <button
                            onClick={() => openDetail(invalid.report)}
                            className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
                          >
                            Lihat Detail Laporan
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">#{report.id}</span>
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
                          {report.reviewedAt && report.status !== 'PENDING' && (
                            <div className="text-xs text-gray-500 mb-2">
                              <span className="font-medium">Direview:</span> {(() => {
                                const date = new Date(report.reviewedAt);
                                return date.toLocaleString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: 'UTC'
                                });
                              })()} WIB {report.reviewedBy && `oleh ${report.reviewedBy.name}`}
                            </div>
                          )}

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
                            {/* Status Tangani Dropdown */}
                            <select
                              value={report.statusTangani}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateStatusTangani(report.id, e.target.value as 'SUDAH_DITANGANI' | 'BELUM_DITANGANI');
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className={`text-xs px-2 py-1 rounded-lg font-medium border cursor-pointer ${
                                report.statusTangani === 'SUDAH_DITANGANI' 
                                  ? 'bg-blue-100 text-blue-700 border-blue-300' 
                                  : 'bg-gray-100 text-gray-700 border-gray-300'
                              }`}
                            >
                              <option value="BELUM_DITANGANI">Belum Ditangani</option>
                              <option value="SUDAH_DITANGANI">Sudah Ditangani</option>
                            </select>
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
              {selectedReport.fotoLokasi && selectedReport.fotoLokasi.length > 0 && (
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
                {selectedReport.reviewedAt && selectedReport.status !== 'PENDING' && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-700 mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Waktu Review</span>
                    </div>
                    <p className="text-blue-900 font-medium text-sm">
                      {(() => {
                        const date = new Date(selectedReport.reviewedAt);
                        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                        const day = date.getUTCDate();
                        const month = months[date.getUTCMonth()];
                        const year = date.getUTCFullYear();
                        const hours = date.getUTCHours().toString().padStart(2, '0');
                        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                        return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
                      })()}
                    </p>
                    {selectedReport.reviewedBy && (
                      <p className="text-blue-700 text-xs mt-1">oleh {selectedReport.reviewedBy.name}</p>
                    )}
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Jenis Kerusakan</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedReport.jenisKerusakan}</p>
                </div>
                {selectedReport.invalidReportsCount && selectedReport.invalidReportsCount > 0 && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-700 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Laporan Tidak Valid</span>
                    </div>
                    <p className="text-amber-900 font-bold text-lg mb-2">
                      {selectedReport.invalidReportsCount} Laporan
                    </p>
                    <button
                      onClick={() => setShowInvalidReportsDetail(!showInvalidReportsDetail)}
                      disabled={isLoadingSelectedInvalidReports}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingSelectedInvalidReports ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Memuat...
                        </>
                      ) : (
                        <>
                          {showInvalidReportsDetail ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {showInvalidReportsDetail ? 'Sembunyikan Detail' : 'Lihat Detail'}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Keterangan */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Keterangan Kerusakan</h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
                  {selectedReport.keteranganKerusakan}
                </p>
              </div>

              {/* Invalid Reports Detail (Expandable) */}
              {showInvalidReportsDetail && selectedReportInvalidReports.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Detail Laporan Tidak Valid ({selectedReportInvalidReports.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedReportInvalidReports.map((ir) => (
                      <div key={ir.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-xs font-semibold text-amber-700 block">
                              {ir.reporterName || 'Anonim'}
                            </span>
                            {ir.kontak && (
                              <span className="text-xs text-amber-600">
                                Kontak: {ir.kontak}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-amber-600">
                            {(() => {
                              const date = new Date(ir.createdAt);
                              const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                              const day = date.getUTCDate();
                              const month = months[date.getUTCMonth()];
                              const year = date.getUTCFullYear();
                              const hours = date.getUTCHours().toString().padStart(2, '0');
                              const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                              return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
                            })()}
                          </span>
                        </div>
                        <div className="bg-white rounded-lg p-3 mt-2">
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {ir.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coordinates */}
              <div className="bg-gray-900 rounded-xl p-4 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Koordinat</span>
                    <p className="font-mono text-sm mt-1">{selectedReport.lat?.toFixed(6) ?? 'N/A'}, {selectedReport.lng?.toFixed(6) ?? 'N/A'}</p>
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
