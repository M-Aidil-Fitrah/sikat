"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import LaporanView from "@/app/components/user/LaporanView";
import { Menu } from "lucide-react";

function LaporanContent() {
  const router = useRouter();
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
    
    // Listen for sidebar changes
    const handleStorageChange = () => {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved !== null) {
        setSidebarCollapsed(saved === "true");
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also check periodically (for same-tab changes)
    const interval = setInterval(handleStorageChange, 100);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/80 flex">
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Content */}
      <main 
        className={`flex-1 min-h-screen transition-all duration-300 lg:${
          sidebarCollapsed ? "ml-20" : "ml-72"
        }`}
      >
        <LaporanView />
      </main>
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
