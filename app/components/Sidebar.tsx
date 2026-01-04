"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  LogOut
} from "lucide-react";

interface SidebarProps {
  defaultCollapsed?: boolean;
  isAdmin?: boolean;
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

export default function Sidebar({ 
  defaultCollapsed = false, 
  isAdmin = false,
  isMobileMenuOpen: externalMobileMenuOpen,
  onMobileMenuToggle
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved ? saved === "true" : defaultCollapsed;
    }
    return defaultCollapsed;
  });
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const isMenuOpen = externalMobileMenuOpen !== undefined ? externalMobileMenuOpen : isMobileMenuOpen;
  const toggleMobileMenu = onMobileMenuToggle || (() => setIsMobileMenuOpen(!isMobileMenuOpen));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    // Return cleanup function to close menu on unmount/route change
    return () => {
      if (!externalMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
  }, [pathname, externalMobileMenuOpen]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/superuser');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = isAdmin ? [
    {
      label: "Dashboard Admin",
      href: "/superuser/dashboard",
      icon: LayoutDashboard,
    },
  ] : [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Laporan",
      href: "/laporan",
      icon: FileText,
    },
  ];

  if (!isMounted) {
    return (
      <>
        {/* Mobile hamburger placeholder */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        {/* Desktop sidebar placeholder */}
        <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col fixed left-0 top-0 bottom-0 z-10">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </aside>
      </>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-72"
        } ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
      {/* Header */}
      <div className={`border-b border-gray-200 ${isCollapsed ? "p-4" : "p-6"}`}>
        <Link href={isAdmin ? "/superuser/dashboard" : "/"} className="flex items-center gap-3 group">
          <img 
            src="/logo-satgas-usk.png" 
            alt="Logo SATGAS USK" 
            className={`transition-all duration-300 ${isCollapsed ? "h-10 w-auto" : "h-11 w-auto"}`}
          />
          {!isCollapsed && (
            <div className="overflow-hidden">
              <span className="text-sm font-bold text-gray-900 block leading-tight">
                {isAdmin ? (
                  <>Admin SIKAT<br/>Dashboard Admin</>
                ) : (
                  <>Sistem Informasi<br/>Kebencanaan Terpadu</>
                )}
              </span>
            </div>
          )}
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? "p-2" : "p-4"} space-y-1`}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative ${
                isActive
                  ? "text-red-600 bg-red-50"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } ${isCollapsed ? "justify-center px-3" : ""}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-red-600" : "text-gray-500 group-hover:text-gray-700"}`} />
              {!isCollapsed && <span>{item.label}</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Collapse Toggle - Small Icon Button (Desktop only) */}
      <div className="hidden lg:block absolute -right-3 top-6 z-50">
        <button
          onClick={toggleCollapse}
          className="w-6 h-6 bg-white border border-gray-200 rounded shadow-sm hover:shadow-md hover:bg-gray-50 flex items-center justify-center transition-all duration-200 group"
          title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
          aria-label={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
          )}
        </button>
      </div>

      {/* Back Button / Logout */}
      <div className={`p-2 border-t border-gray-200 mt-auto ${isCollapsed ? "px-2" : "px-4"}`}>
        {isAdmin ? (
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-colors group w-full ${
              isCollapsed ? "justify-center px-3" : ""
            }`}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-600" />
            {!isCollapsed && <span>Logout</span>}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        ) : (
          <Link 
            href="/" 
            className={`flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors group ${
              isCollapsed ? "justify-center px-3" : ""
            }`}
            title={isCollapsed ? "Kembali" : undefined}
          >
            <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
            {!isCollapsed && <span>Kembali</span>}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                Kembali
              </div>
            )}
          </Link>
        )}
      </div>
    </aside>
    </>
  );
}
