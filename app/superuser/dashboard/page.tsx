"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';
import { 
  Shield, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  Phone,
  AlertTriangle,
  FileText,
  Loader2,
  X,
  Image as ImageIcon,
  LayoutDashboard,
  Filter,
  ChevronRight
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

  // Load reports
  useEffect(() => {
    loadReports();
  }, []);

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
      
      // API returns { success: true, data: [...], stats: {...} }
      if (data.success && data.data && Array.isArray(data.data)) {
        console.log(`Successfully loaded ${data.data.length} reports`);
        setReports(data.data);
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

  // Statistik
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'PENDING').length,
    approved: reports.filter(r => r.status === 'APPROVED').length,
    rejected: reports.filter(r => r.status === 'REJECTED').length,
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 bottom-0 z-10">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-linear-to-br from-red-600 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 block">Admin SIKAT</span>
              <span className="text-xs text-gray-500">Dashboard Admin</span>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-1 flex-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 bg-red-50 rounded-xl font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
            <p className="text-gray-600">Kelola dan verifikasi laporan bencana alam</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
                <span className="text-sm text-gray-500">Total</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Laporan</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-yellow-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-sm text-yellow-700">Total</span>
              </div>
              <p className="text-3xl font-bold text-yellow-600 mb-1">{stats.pending}</p>
              <p className="text-sm text-gray-600">Menunggu Verifikasi</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm text-green-700">Total</span>
              </div>
              <p className="text-3xl font-bold text-green-600 mb-1">{stats.approved}</p>
              <p className="text-sm text-gray-600">Disetujui</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-sm text-red-700">Total</span>
              </div>
              <p className="text-3xl font-bold text-red-600 mb-1">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Ditolak</p>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">Filter Status:</span>
              <div className="flex gap-2 flex-1">
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Daftar Laporan</h2>
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

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {report.namaPelapor}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {report.desaKecamatan}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(report.submittedAt || report.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-700">
                              {report.jenisKerusakan}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                              report.tingkatKerusakan === 'RINGAN' ? 'bg-green-100 text-green-700' :
                              report.tingkatKerusakan === 'SEDANG' ? 'bg-yellow-100 text-yellow-700' :
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedReport.namaObjek}</h2>
                <p className="text-sm text-gray-600 mt-1">Detail Laporan #{selectedReport.id}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  selectedReport.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  selectedReport.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedReport.status === 'PENDING' ? '⏳ Menunggu Verifikasi' : 
                   selectedReport.status === 'APPROVED' ? '✓ Disetujui' : '✗ Ditolak'}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Pelapor</p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="font-semibold text-gray-900">{selectedReport.namaPelapor}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Kontak</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="font-semibold text-gray-900">{selectedReport.kontak}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Lokasi</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p className="font-semibold text-gray-900">{selectedReport.desaKecamatan}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Waktu Laporan</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedReport.submittedAt || selectedReport.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Kerusakan Info */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Jenis Kerusakan</p>
                  <p className="font-semibold text-gray-900 bg-gray-50 rounded-xl p-3">
                    {selectedReport.jenisKerusakan}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Tingkat Kerusakan</p>
                  <span className={`inline-block px-4 py-2 rounded-xl font-semibold ${
                    selectedReport.tingkatKerusakan === 'RINGAN' ? 'bg-green-100 text-green-700' :
                    selectedReport.tingkatKerusakan === 'SEDANG' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedReport.tingkatKerusakan}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Keterangan</p>
                  <p className="text-gray-900 bg-gray-50 rounded-xl p-4">
                    {selectedReport.keteranganKerusakan}
                  </p>
                </div>
              </div>

              {/* Photos */}
              {selectedReport.fotoLokasi && selectedReport.fotoLokasi.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ImageIcon className="w-5 h-5 text-gray-600" />
                    <p className="text-sm font-semibold text-gray-900">Foto Kerusakan ({selectedReport.fotoLokasi.length})</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedReport.fotoLokasi.map((foto, idx) => (
                      <img
                        key={idx}
                        src={foto}
                        alt={`Kerusakan ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-xl border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(foto, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions - Only for PENDING */}
              {selectedReport.status === 'PENDING' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
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
