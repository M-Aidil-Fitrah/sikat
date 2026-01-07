"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import AdminDashboardView from '@/app/components/superuser/AdminDashboardView';
import { Loader2 } from 'lucide-react';

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar 
        isAdmin={true}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Content - Dashboard View */}
      <AdminDashboardView />
    </div>
  );
}
