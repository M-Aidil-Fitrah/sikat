"use client";

import { useState, Suspense } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/app/components/Sidebar";
import LaporanView from "@/app/components/user/LaporanView";

function LaporanContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isAdmin={false}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onCollapsedChange={(collapsed) => setSidebarCollapsed(collapsed)}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300 ${
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
      }`}>
        {/* Mobile Hamburger Menu */}
        <div className="lg:hidden z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
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
        <LaporanView />
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function LaporanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Memuat laporan...</p>
        </div>
      </div>
    }>
      <LaporanContent />
    </Suspense>
  );
}
