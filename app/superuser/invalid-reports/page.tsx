"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import InvalidReportsView from '@/app/components/superuser/InvalidReportsView';
import { Menu } from 'lucide-react';

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';

export default function InvalidReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.replace('/superuser');
          return;
        }
        const data = await response.json();
        // Check for valid user with admin role (lowercase from database)
        if (!data.user || data.user.role !== 'admin') {
          router.replace('/superuser');
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/superuser');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isAdmin={true}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onCollapsedChange={(collapsed) => setSidebarCollapsed(collapsed)}
      />

      {/* Main Content */}
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
        
        <InvalidReportsView />
      </div>
    </div>
  );
}
