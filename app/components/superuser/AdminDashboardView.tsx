"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminReportDetailModal from './AdminReportDetailModal';
import Pagination from '@/app/components/ui/Pagination';
import * as XLSX from 'xlsx';
import { 
  Clock, 
  MapPin, 
  User, 
  FileText,
  Loader2,
  Download,
  RefreshCw,
  Search,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Eye,
  Trash2,
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

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
type SortField = 'id' | 'submittedAt' | 'status' | 'tingkatKerusakan' | 'namaObjek';
type SortOrder = 'asc' | 'desc';

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

export default function AdminDashboardView() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('submittedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load reports function (defined before useEffect)
  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/reports');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/superuser');
          return;
        }
        throw new Error('Gagal memuat laporan');
      }

      const data = await response.json();
      
      if (data.success && data.reports && Array.isArray(data.reports)) {
        setReports(data.reports);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      alert('Gagal memuat laporan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Load reports on mount
  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Auto logout setelah 1 jam tidak ada aktivitas
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(async () => {
        console.log('Session timeout - logging out due to inactivity');
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error('Logout error:', error);
        }
        router.push('/superuser?error=inactivity');
      }, 3600000);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [router]);

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    let result = [...reports];

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(r => r.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.namaObjek.toLowerCase().includes(query) ||
        r.desaKecamatan.toLowerCase().includes(query) ||
        r.namaPelapor.toLowerCase().includes(query) ||
        r.jenisKerusakan.toLowerCase().includes(query) ||
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
        case 'status': {
          const statusOrder = { 'PENDING': 1, 'APPROVED': 2, 'REJECTED': 3 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        }
        case 'tingkatKerusakan': {
          const severityOrder = { 'Berat': 3, 'Sedang': 2, 'Ringan': 1 };
          comparison = (severityOrder[a.tingkatKerusakan as keyof typeof severityOrder] || 0) - 
                       (severityOrder[b.tingkatKerusakan as keyof typeof severityOrder] || 0);
          break;
        }
        case 'namaObjek':
          comparison = a.namaObjek.localeCompare(b.namaObjek);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [reports, statusFilter, searchQuery, sortField, sortOrder]);

  // Paginated reports
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReports, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, itemsPerPage]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const updateStatus = async (reportId: number, newStatus: 'APPROVED' | 'REJECTED') => {
    setIsUpdating(reportId);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengupdate status');
      }

      alert(`Laporan berhasil ${newStatus === 'APPROVED' ? 'diverifikasi' : 'ditolak'}!`);
      await loadReports();
      setShowDetailModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Gagal mengupdate status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(null);
    }
  };

  const updateStatusTangani = async (reportId: number, newStatusTangani: 'SUDAH_DITANGANI' | 'BELUM_DITANGANI') => {
    try {
      const currentReport = reports.find(r => r.id === reportId);
      if (!currentReport) return;

      setReports(prevReports => 
        prevReports.map(r => 
          r.id === reportId ? { ...r, statusTangani: newStatusTangani } : r
        )
      );

      const response = await fetch(`/api/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: currentReport.status,
          statusTangani: newStatusTangani 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setReports(prevReports => 
          prevReports.map(r => 
            r.id === reportId ? { ...r, statusTangani: currentReport.statusTangani } : r
          )
        );
        throw new Error(data.error || 'Gagal mengupdate status tangani');
      }
    } catch (error) {
      console.error('Error updating statusTangani:', error);
      alert(`Gagal mengupdate status penanganan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deleteReport = async (reportId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus laporan ini? Semua laporan tidak valid terkait juga akan dihapus.')) {
      return;
    }

    setIsDeleting(reportId);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus laporan');
      }

      alert('Laporan berhasil dihapus!');
      await loadReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert(`Gagal menghapus laporan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const openDetail = (report: Report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  // Download reports as Excel with multiple sheets
  const downloadExcel = async () => {
    try {
      // Sheet 1: Laporan Utama
      const reportsData = filteredReports.map((report, index) => ({
        'No': index + 1,
        'ID': report.id,
        'Nama Objek': report.namaObjek,
        'Jenis Kerusakan': report.jenisKerusakan,
        'Tingkat Kerusakan': report.tingkatKerusakan,
        'Lokasi': report.desaKecamatan,
        'Latitude': report.lat ?? 'N/A',
        'Longitude': report.lng ?? 'N/A',
        'Nama Pelapor': report.namaPelapor,
        'Kontak': report.kontak,
        'Keterangan': report.keteranganKerusakan,
        'Status': report.status === 'PENDING' ? 'Menunggu' : report.status === 'APPROVED' ? 'Telah Diverifikasi' : 'Ditolak',
        'Status Penanganan': report.statusTangani === 'SUDAH_DITANGANI' ? 'Sudah Ditangani' : 'Belum Ditangani',
        'Tanggal Lapor': formatDateTime(report.submittedAt || report.createdAt),
        'Tanggal Review': report.reviewedAt ? formatDateTime(report.reviewedAt) : '-',
        'Direview Oleh': report.reviewedBy ? report.reviewedBy.name : '-',
        'Jumlah Laporan Tidak Valid': report.invalidReportsCount || 0,
      }));

      const wsReports = XLSX.utils.json_to_sheet(reportsData);
      
      // Set column widths untuk sheet Laporan
      wsReports['!cols'] = [
        { wch: 5 },  // No
        { wch: 8 },  // ID
        { wch: 25 }, // Nama Objek
        { wch: 25 }, // Jenis Kerusakan
        { wch: 15 }, // Tingkat Kerusakan
        { wch: 30 }, // Lokasi
        { wch: 12 }, // Latitude
        { wch: 12 }, // Longitude
        { wch: 20 }, // Nama Pelapor
        { wch: 15 }, // Kontak
        { wch: 40 }, // Keterangan
        { wch: 18 }, // Status
        { wch: 18 }, // Status Penanganan
        { wch: 20 }, // Tanggal Lapor
        { wch: 20 }, // Tanggal Review
        { wch: 20 }, // Direview Oleh
        { wch: 12 }, // Jumlah Laporan Tidak Valid
      ];

      // Sheet 2: Laporan Tidak Valid
      const invalidReportsResponse = await fetch('/api/invalid-reports');
      let invalidReportsData: Array<{
        'No': number;
        'ID Laporan Tidak Valid': string;
        'ID Laporan Utama': number;
        'Nama Objek (Laporan Utama)': string;
        'Lokasi (Laporan Utama)': string;
        'Alasan Tidak Valid': string;
        'Pelapor Keberatan': string;
        'Kontak Pelapor': string;
        'Tanggal Dilaporkan': string;
      }> = [];
      
      if (invalidReportsResponse.ok) {
        const invalidData = await invalidReportsResponse.json();
        if (invalidData.success && Array.isArray(invalidData.data)) {
          invalidReportsData = invalidData.data.map((ir: {
            id: string;
            reportId: number;
            report?: { namaObjek?: string; desaKecamatan?: string };
            reason: string;
            reporterName: string | null;
            kontak: string | null;
            createdAt: string;
          }, index: number) => ({
            'No': index + 1,
            'ID Laporan Tidak Valid': ir.id,
            'ID Laporan Utama': ir.reportId,
            'Nama Objek (Laporan Utama)': ir.report?.namaObjek || 'N/A',
            'Lokasi (Laporan Utama)': ir.report?.desaKecamatan || 'N/A',
            'Alasan Tidak Valid': ir.reason,
            'Pelapor Keberatan': ir.reporterName || 'Anonim',
            'Kontak Pelapor': ir.kontak || 'Tidak Ada',
            'Tanggal Dilaporkan': formatDateTime(ir.createdAt),
          }));
        }
      }

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Add Laporan sheet
      XLSX.utils.book_append_sheet(wb, wsReports, 'Laporan Bencana');
      
      // Add Invalid Reports sheet if there's data
      if (invalidReportsData.length > 0) {
        const wsInvalid = XLSX.utils.json_to_sheet(invalidReportsData);
        
        // Set column widths untuk sheet Laporan Tidak Valid
        wsInvalid['!cols'] = [
          { wch: 5 },  // No
          { wch: 25 }, // ID Laporan Tidak Valid
          { wch: 15 }, // ID Laporan Utama
          { wch: 30 }, // Nama Objek
          { wch: 30 }, // Lokasi
          { wch: 50 }, // Alasan
          { wch: 20 }, // Pelapor
          { wch: 15 }, // Kontak
          { wch: 20 }, // Tanggal
        ];
        
        XLSX.utils.book_append_sheet(wb, wsInvalid, 'Laporan Tidak Valid');
      }
      
      // Generate filename
      const today = new Date();
      const filename = `Laporan_Bencana_${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}.xlsx`;
      
      // Write file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Gagal mengunduh Excel. Silakan coba lagi.');
    }
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'PENDING').length,
    approved: reports.filter(r => r.status === 'APPROVED').length,
    rejected: reports.filter(r => r.status === 'REJECTED').length,
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-red-600" /> : <ArrowDown className="w-3.5 h-3.5 text-red-600" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-700';
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Berat':
        return { badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' };
      case 'Sedang':
        return { badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' };
      default:
        return { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' };
    }
  };

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
    <>
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Dashboard Admin</h1>
              <p className="text-gray-500 mt-1 text-sm">Kelola dan verifikasi laporan bencana</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadReports}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={downloadExcel}
                disabled={filteredReports.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-red-600 to-orange-600 text-white rounded-xl text-sm font-medium hover:from-red-700 hover:to-orange-700 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Stats Cards - styled like UserDashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <button 
              onClick={() => setStatusFilter('ALL')}
              className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all text-left shadow-sm ${
                statusFilter === 'ALL' 
                  ? 'bg-linear-to-br from-red-500 to-red-600 text-white shadow-xl shadow-red-500/30' 
                  : 'bg-white border border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center ${
                  statusFilter === 'ALL' ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-100'
                }`}>
                  <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${statusFilter === 'ALL' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                {statusFilter === 'ALL' && <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">Active</span>}
              </div>
              <div className={`text-2xl sm:text-3xl font-bold mb-1 ${statusFilter === 'ALL' ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
              <div className={`font-medium text-xs sm:text-sm ${statusFilter === 'ALL' ? 'text-red-100' : 'text-gray-500'}`}>Total Laporan</div>
            </button>
            
            <button 
              onClick={() => setStatusFilter('PENDING')}
              className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all text-left shadow-sm ${
                statusFilter === 'PENDING' 
                  ? 'bg-linear-to-br from-amber-500 to-amber-600 text-white shadow-xl shadow-amber-500/30' 
                  : 'bg-white border border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center ${
                  statusFilter === 'PENDING' ? 'bg-white/20 backdrop-blur-sm' : 'bg-amber-100'
                }`}>
                  <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${statusFilter === 'PENDING' ? 'text-white' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className={`text-2xl sm:text-3xl font-bold mb-1 ${statusFilter === 'PENDING' ? 'text-white' : 'text-amber-600'}`}>{stats.pending}</div>
              <div className={`font-medium text-xs sm:text-sm ${statusFilter === 'PENDING' ? 'text-amber-100' : 'text-gray-500'}`}>Menunggu</div>
            </button>
            
            <button 
              onClick={() => setStatusFilter('APPROVED')}
              className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all text-left shadow-sm ${
                statusFilter === 'APPROVED' 
                  ? 'bg-linear-to-br from-green-500 to-green-600 text-white shadow-xl shadow-green-500/30' 
                  : 'bg-white border border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center ${
                  statusFilter === 'APPROVED' ? 'bg-white/20 backdrop-blur-sm' : 'bg-green-100'
                }`}>
                  <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${statusFilter === 'APPROVED' ? 'text-white' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className={`text-2xl sm:text-3xl font-bold mb-1 ${statusFilter === 'APPROVED' ? 'text-white' : 'text-green-600'}`}>{stats.approved}</div>
              <div className={`font-medium text-xs sm:text-sm ${statusFilter === 'APPROVED' ? 'text-green-100' : 'text-gray-500'}`}>Telah Diverifikasi</div>
            </button>
            
            <button 
              onClick={() => setStatusFilter('REJECTED')}
              className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all text-left shadow-sm ${
                statusFilter === 'REJECTED' 
                  ? 'bg-linear-to-br from-red-500 to-rose-600 text-white shadow-xl shadow-red-500/30' 
                  : 'bg-white border border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center ${
                  statusFilter === 'REJECTED' ? 'bg-white/20 backdrop-blur-sm' : 'bg-red-100'
                }`}>
                  <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${statusFilter === 'REJECTED' ? 'text-white' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className={`text-2xl sm:text-3xl font-bold mb-1 ${statusFilter === 'REJECTED' ? 'text-white' : 'text-red-600'}`}>{stats.rejected}</div>
              <div className={`font-medium text-xs sm:text-sm ${statusFilter === 'REJECTED' ? 'text-red-100' : 'text-gray-500'}`}>Ditolak</div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, lokasi, pelapor, ID..."
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

          {/* Table */}
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Tidak ada laporan</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery || statusFilter !== 'ALL' ? 'Coba ubah filter atau kata kunci' : 'Belum ada laporan masuk'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4">
                        <button onClick={() => toggleSort('id')} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900">
                          ID <SortIcon field="id" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">
                        <button onClick={() => toggleSort('namaObjek')} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900">
                          Nama Objek <SortIcon field="namaObjek" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Lokasi</span>
                      </th>
                      <th className="text-left py-3 px-4">
                        <button onClick={() => toggleSort('status')} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900">
                          Status <SortIcon field="status" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">
                        <button onClick={() => toggleSort('tingkatKerusakan')} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900">
                          Tingkat <SortIcon field="tingkatKerusakan" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Penanganan</span>
                      </th>
                      <th className="text-left py-3 px-4">
                        <button onClick={() => toggleSort('submittedAt')} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900">
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
                      const severityStyle = getSeverityBadge(report.tingkatKerusakan);
                      return (
                        <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              #{report.id}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm truncate max-w-32" title={report.namaObjek}>
                                {report.namaObjek.length > 20 ? `${report.namaObjek.slice(0, 20)}...` : report.namaObjek}
                              </p>
                              <p className="text-xs text-gray-500 truncate flex items-center gap-1" title={report.namaPelapor}>
                                <User className="w-3 h-3" /> 
                                {report.namaPelapor.length > 25 ? `${report.namaPelapor.slice(0, 25)}...` : report.namaPelapor}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate max-w-30">{report.desaKecamatan}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {report.status === 'PENDING' ? (
                              <select
                                value={report.status}
                                onChange={(e) => updateStatus(report.id, e.target.value as 'APPROVED' | 'REJECTED')}
                                disabled={isUpdating === report.id}
                                className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${getStatusBadge(report.status)} disabled:opacity-50`}
                              >
                                <option value="PENDING">Menunggu</option>
                                <option value="APPROVED">Verifikasi</option>
                                <option value="REJECTED">Tolak</option>
                              </select>
                            ) : (
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}>
                                {report.status === 'APPROVED' ? 'Telah Diverifikasi' : 'Ditolak'}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium w-fit ${severityStyle.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${severityStyle.dot}`}></span>
                              {report.tingkatKerusakan}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={report.statusTangani}
                              onChange={(e) => updateStatusTangani(report.id, e.target.value as 'SUDAH_DITANGANI' | 'BELUM_DITANGANI')}
                              className={`text-xs px-2 py-1 rounded-lg font-medium border-0 cursor-pointer ${
                                report.statusTangani === 'SUDAH_DITANGANI' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              <option value="BELUM_DITANGANI">Belum</option>
                              <option value="SUDAH_DITANGANI">Sudah</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span className="whitespace-nowrap">{formatDateTime(report.submittedAt)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openDetail(report)}
                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteReport(report.id)}
                                disabled={isDeleting === report.id}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Hapus"
                              >
                                {isDeleting === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
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
      {showDetailModal && selectedReport && (
        <AdminReportDetailModal
          report={selectedReport}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReport(null);
          }}
          onUpdateStatus={updateStatus}
          isUpdating={isUpdating}
        />
      )}
    </>
  );
}
