"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminReportDetailModal from './AdminReportDetailModal';
import Pagination from '@/app/components/ui/Pagination';
import * as XLSX from 'xlsx';
import { 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle,
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

  // Load reports on mount
  useEffect(() => {
    loadReports();
  }, []);

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

  const loadReports = async () => {
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
  };

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

  // Download reports as Excel
  const downloadExcel = () => {
    const excelData = filteredReports.map((report, index) => ({
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
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
    
    const today = new Date();
    const filename = `Laporan_Bencana_${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}.xlsx`;
    XLSX.writeFile(wb, filename);
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
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <button 
              onClick={() => setStatusFilter('ALL')}
              className={`rounded-xl border p-4 transition-all text-left ${
                statusFilter === 'ALL' ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`text-2xl font-bold ${statusFilter === 'ALL' ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
              <div className={`text-xs font-medium ${statusFilter === 'ALL' ? 'text-gray-300' : 'text-gray-500'}`}>Total</div>
            </button>
            <button 
              onClick={() => setStatusFilter('PENDING')}
              className={`rounded-xl border p-4 transition-all text-left ${
                statusFilter === 'PENDING' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-amber-50 border-amber-100 hover:border-amber-200'
              }`}
            >
              <div className={`text-2xl font-bold ${statusFilter === 'PENDING' ? 'text-white' : 'text-amber-600'}`}>{stats.pending}</div>
              <div className={`text-xs font-medium ${statusFilter === 'PENDING' ? 'text-amber-100' : 'text-amber-600'}`}>Menunggu</div>
            </button>
            <button 
              onClick={() => setStatusFilter('APPROVED')}
              className={`rounded-xl border p-4 transition-all text-left ${
                statusFilter === 'APPROVED' ? 'bg-green-500 border-green-500 text-white' : 'bg-green-50 border-green-100 hover:border-green-200'
              }`}
            >
              <div className={`text-2xl font-bold ${statusFilter === 'APPROVED' ? 'text-white' : 'text-green-600'}`}>{stats.approved}</div>
              <div className={`text-xs font-medium ${statusFilter === 'APPROVED' ? 'text-green-100' : 'text-green-600'}`}>Terverifikasi</div>
            </button>
            <button 
              onClick={() => setStatusFilter('REJECTED')}
              className={`rounded-xl border p-4 transition-all text-left ${
                statusFilter === 'REJECTED' ? 'bg-red-500 border-red-500 text-white' : 'bg-red-50 border-red-100 hover:border-red-200'
              }`}
            >
              <div className={`text-2xl font-bold ${statusFilter === 'REJECTED' ? 'text-white' : 'text-red-600'}`}>{stats.rejected}</div>
              <div className={`text-xs font-medium ${statusFilter === 'REJECTED' ? 'text-red-100' : 'text-red-600'}`}>Ditolak</div>
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
                      <th className="text-left py-3 px-4 hidden md:table-cell">
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
                      <th className="text-left py-3 px-4 hidden lg:table-cell">
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
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate max-w-32" title={report.namaObjek}>
                                {report.namaObjek.length > 20 ? `${report.namaObjek.slice(0, 20)}...` : report.namaObjek}
                              </p>
                              <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                <User className="w-3 h-3" /> {report.namaPelapor}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">
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
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${severityStyle.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${severityStyle.dot}`}></span>
                              {report.tingkatKerusakan}
                            </span>
                          </td>
                          <td className="py-3 px-4 hidden lg:table-cell">
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
