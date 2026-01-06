"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';
import { 
  AlertTriangle,
  User,
  Clock,
  FileText,
  Menu,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface Report {
  id: number;
  namaObjek: string;
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

export default function InvalidReportsPage() {
  const router = useRouter();
  const [invalidReports, setInvalidReports] = useState<InvalidReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          setIsAuthenticated(true);
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

    checkAuth();
  }, [router]);

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
      } else {
        setInvalidReports([]);
      }
    } catch (error) {
      console.error('Error loading invalid reports:', error);
      alert('Gagal memuat laporan tidak valid. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadInvalidReports();
    }
  }, [isAuthenticated]);

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

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar 
        isAdmin={true} 
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Mobile hamburger */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-all"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8 pt-12 lg:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Laporan Tidak Valid</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Kelola dan pantau laporan yang dilaporkan tidak valid</p>
              </div>
              <button
                onClick={loadInvalidReports}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{invalidReports.length}</div>
              <div className="text-gray-500 font-medium">Total Laporan Tidak Valid</div>
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
            ) : invalidReports.length === 0 ? (
              <div className="p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada laporan tidak valid</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {invalidReports.map((ir) => (
                  <div
                    key={ir.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              Laporan: {ir.report?.namaObjek || 'N/A'} (ID: {ir.reportId})
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {ir.reporterName || 'Anonim'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDateTime(ir.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mt-2">
                          <div className="flex items-start gap-2 mb-1">
                            <FileText className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                            <span className="text-xs font-semibold text-gray-700 uppercase">Alasan</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {ir.reason}
                          </p>
                        </div>

                        {ir.kontak && (
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="font-medium">Kontak:</span> {ir.kontak}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
