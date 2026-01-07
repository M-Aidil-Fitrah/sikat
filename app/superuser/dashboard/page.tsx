"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import AdminDashboardView from '@/app/components/superuser/AdminDashboardView';
import { Loader2, Menu } from 'lucide-react';

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      
      if (response.status === 401) {
        router.push('/superuser?error=session_expired');
        return;
      }
      
      if (response.ok) {
        setIsAuthenticated(true);
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isAdmin={true}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onCollapsedChange={(collapsed) => setSidebarCollapsed(collapsed)}
      />

      {/* Main Content - Dashboard View */}
      <div className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300 ${
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
      }`}>
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
        
        <AdminDashboardView />
      </div>
    </div>
  );
}
