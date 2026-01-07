"use client";

import { useState, useEffect } from 'react';
import AdminReportDetailModal from './AdminReportDetailModal';
import { 
  AlertTriangle,
  User,
  Clock,
  FileText,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface Report {
  id: number;
  namaObjek: string;
  namaPelapor: string;
  kontak: string;
  desaKecamatan: string;
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

interface GroupedInvalidReports {
  reportId: number;
  report: Report;
  invalidReports: Array<{
    id: string;
    reason: string;
    reporterName: string | null;
    kontak: string | null;
    createdAt: string;
  }>;
}

export default function InvalidReportsView() {
  const [invalidReports, setInvalidReports] = useState<InvalidReportData[]>([]);
  const [groupedReports, setGroupedReports] = useState<GroupedInvalidReports[]>([]);
  const [expandedReports, setExpandedReports] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Load invalid reports
  const loadInvalidReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/invalid-reports');
      
      if (!response.ok) {
        throw new Error('Gagal memuat laporan tidak valid');
      }

      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data)) {
        setInvalidReports(data.data);
        
        // Group reports by reportId
        const grouped = groupInvalidReportsByReportId(data.data);
        setGroupedReports(grouped);
      } else {
        setInvalidReports([]);
        setGroupedReports([]);
      }
    } catch (error) {
      console.error('Error loading invalid reports:', error);
      alert('Gagal memuat laporan tidak valid. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Group invalid reports by reportId
  const groupInvalidReportsByReportId = (reports: InvalidReportData[]): GroupedInvalidReports[] => {
    const grouped = new Map<number, GroupedInvalidReports>();
    
    reports.forEach(ir => {
      if (!grouped.has(ir.reportId)) {
        grouped.set(ir.reportId, {
          reportId: ir.reportId,
          report: ir.report,
          invalidReports: []
        });
      }
      
      grouped.get(ir.reportId)!.invalidReports.push({
        id: ir.id,
        reason: ir.reason,
        reporterName: ir.reporterName,
        kontak: ir.kontak,
        createdAt: ir.createdAt
      });
    });
    
    return Array.from(grouped.values()).sort((a, b) => {
      // Sort by most recent invalid report
      const aLatest = Math.max(...a.invalidReports.map(ir => new Date(ir.createdAt).getTime()));
      const bLatest = Math.max(...b.invalidReports.map(ir => new Date(ir.createdAt).getTime()));
      return bLatest - aLatest;
    });
  };

  // Toggle expand/collapse for a report
  const toggleExpand = (reportId: number) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  // Open detail modal
  const openDetailModal = (report: Report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  useEffect(() => {
    loadInvalidReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format date/time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const day = date.getUTCDate();
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Laporan Tidak Valid</h1>
            <p className="text-gray-500 mt-1 text-sm">Kelola dan pantau laporan yang dilaporkan tidak valid</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refresh Button */}
            <button
              onClick={loadInvalidReports}
              disabled={isLoading}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Wrapper */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Stats Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-amber-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
              <span className="text-xs sm:text-sm text-amber-700">Total</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">{invalidReports.length}</p>
            <p className="text-xs sm:text-sm text-gray-600">Total Laporan Tidak Valid</p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <span className="text-xs sm:text-sm text-blue-700">Total</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{groupedReports.length}</p>
            <p className="text-xs sm:text-sm text-gray-600">Laporan Terpengaruh</p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <span className="text-xs sm:text-sm text-purple-700">Rata-rata</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
              {groupedReports.length > 0 ? (invalidReports.length / groupedReports.length).toFixed(1) : '0'}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Laporan per Objek</p>
          </div>
        </div>

        {/* Invalid Reports List */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-gray-100">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Daftar Laporan Tidak Valid</h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : groupedReports.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada laporan tidak valid</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {groupedReports.map((group) => {
                const isExpanded = expandedReports.has(group.reportId);
                const latestInvalidReport = group.invalidReports.reduce((latest, current) => {
                  return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
                }, group.invalidReports[0]);

                return (
                  <div key={group.reportId} className="hover:bg-gray-50 transition-colors">
                    {/* Header - Always visible */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Status Indicator */}
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                  #{group.reportId}
                                </span>
                                <h3 className="font-semibold text-gray-900">
                                  {group.report.namaObjek}
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                  {group.invalidReports.length} Laporan
                                </span>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-600 mb-2">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{group.report.desaKecamatan}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 shrink-0" />
                                  {formatDateTime(latestInvalidReport.createdAt)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-700">
                                  {group.report.jenisKerusakan}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                                  group.report.tingkatKerusakan === 'Ringan' ? 'bg-green-100 text-green-700' :
                                  group.report.tingkatKerusakan === 'Sedang' ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {group.report.tingkatKerusakan}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => toggleExpand(group.reportId)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Sembunyikan Detail
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Lihat Detail ({group.invalidReports.length})
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => openDetailModal(group.report)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              Detail Laporan
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content - Invalid Reports Details */}
                    {isExpanded && (
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                        <div className="ml-5 sm:ml-6 pl-3 sm:pl-4 border-l-2 border-amber-200">
                          <div className="space-y-3">
                            {group.invalidReports.map((ir, index) => (
                              <div key={ir.id} className="bg-amber-50 rounded-lg p-3 sm:p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                        Laporan #{index + 1}
                                      </span>
                                      <span className="text-xs text-amber-600">
                                        ID: {ir.id.substring(0, 8)}...
                                      </span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-xs text-gray-600 mb-2">
                                      <span className="flex items-center gap-1">
                                        <User className="w-3.5 h-3.5 shrink-0" />
                                        {ir.reporterName || 'Anonim'}
                                      </span>
                                      {ir.kontak && (
                                        <span className="flex items-center gap-1">
                                          <Phone className="w-3.5 h-3.5 shrink-0" />
                                          {ir.kontak}
                                        </span>
                                      )}
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 shrink-0" />
                                        {formatDateTime(ir.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg p-3 border border-amber-200">
                                  <div className="flex items-start gap-2 mb-1">
                                    <FileText className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                    <span className="text-xs font-semibold text-gray-700 uppercase">Alasan</span>
                                  </div>
                                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {ir.reason}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <AdminReportDetailModal
          report={selectedReport}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </>
  );
}
