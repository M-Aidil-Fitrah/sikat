"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  TrendingUp,
  FileText,
  Loader2
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
      const response = await fetch(`/api/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengupdate status');
      }

      // Reload data
      await loadReports();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal mengupdate status laporan');
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

  // Statistik
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'PENDING').length,
    approved: reports.filter(r => r.status === 'APPROVED').length,
    rejected: reports.filter(r => r.status === 'REJECTED').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-red-600 to-orange-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                <p className="text-sm text-gray-600">Kelola laporan bencana alam</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Laporan</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 mb-1">Menunggu</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Disetujui</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 mb-1">Ditolak</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-700 mr-2">Filter Status:</span>
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as StatusFilter[]).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-linear-to-r from-red-600 to-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'Semua' : status === 'PENDING' ? 'Menunggu' : status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada laporan dengan status ini</p>
            </div>
          ) : (
            filteredReports.map(report => (
              <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{report.namaObjek}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          report.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {report.status === 'PENDING' ? 'Menunggu' : report.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {report.desaKecamatan}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(report.submittedAt || report.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pelapor</p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <p className="font-medium text-gray-900">{report.namaPelapor}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Kontak</p>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="font-medium text-gray-900">{report.kontak}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Jenis Kerusakan</p>
                      <p className="font-medium text-gray-900">{report.jenisKerusakan}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tingkat Kerusakan</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        report.tingkatKerusakan === 'RINGAN' ? 'bg-green-100 text-green-700' :
                        report.tingkatKerusakan === 'SEDANG' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {report.tingkatKerusakan}
                      </span>
                    </div>
                  </div>

                  {/* Keterangan */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Keterangan</p>
                    <p className="text-gray-900">{report.keteranganKerusakan}</p>
                  </div>

                  {/* Photos */}
                  {report.fotoLokasi && report.fotoLokasi.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Foto Kerusakan</p>
                      <div className="flex gap-2 overflow-x-auto">
                        {report.fotoLokasi.map((foto, idx) => (
                          <img
                            key={idx}
                            src={foto}
                            alt={`Kerusakan ${idx + 1}`}
                            className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions - Only show for PENDING reports */}
                  {report.status === 'PENDING' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => updateStatus(report.id, 'APPROVED')}
                        disabled={isUpdating === report.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating === report.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Setujui
                      </button>
                      <button
                        onClick={() => updateStatus(report.id, 'REJECTED')}
                        disabled={isUpdating === report.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-red-600 to-rose-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating === report.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
