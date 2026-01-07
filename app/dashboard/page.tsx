"use client";

import { useState, Suspense } from "react";
import Sidebar from "@/app/components/Sidebar";
import UserDashboardView from "@/app/components/user/UserDashboardView";
import { Menu } from "lucide-react";

// Inner component that uses client-side hooks
function DashboardContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isAdmin={false}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onCollapsedChange={(collapsed) => setSidebarCollapsed(collapsed)}
      />

      {/* Main Content */}
      <main className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300 ${
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
      }`}>
        {/* Mobile Hamburger Menu */}
        <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo-satgas-usk.png" alt="Logo Satgas USK" className="w-8 h-8 object-contain" />
            <span className="text-lg font-bold text-gray-900">Geotagging</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        <UserDashboardView />
      </main>
    </div>
  );
}

// Main export with Suspense boundary
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
