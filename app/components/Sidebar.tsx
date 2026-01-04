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
  LogOut,
  Shield
} from "lucide-react";

interface SidebarProps {
  defaultCollapsed?: boolean;
  isAdmin?: boolean;
}

export default function Sidebar({ defaultCollapsed = false, isAdmin = false }: SidebarProps) {
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

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
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 bottom-0 z-10">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside 
      className={`bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 bottom-0 z-10 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Header */}
      <div className={`border-b border-gray-200 ${isCollapsed ? "p-4" : "p-6"}`}>
        <Link href={isAdmin ? "/superuser/dashboard" : "/"} className="flex items-center gap-3 group">
          {isAdmin ? (
            <>
              <div className="w-11 h-11 bg-linear-to-br from-red-600 to-orange-500 rounded-xl flex items-center justify-center shadow-md shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <span className="text-lg font-bold text-gray-900 block">Admin SIKAT</span>
                  <span className="text-xs text-gray-500">Dashboard Admin</span>
                </div>
              )}
            </>
          ) : (
            <>
              <img 
                src="/logo-satgas-usk.png" 
                alt="Logo SATGAS USK" 
                className={`transition-all duration-300 ${isCollapsed ? "h-10 w-auto" : "h-11 w-auto"}`}
              />
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <span className="text-sm font-bold text-gray-900 block leading-tight">
                    Sistem Informasi<br/>Kebencanaan Terpadu
                  </span>
                </div>
              )}
            </>
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
      
      {/* Collapse Toggle - Small Icon Button */}
      <div className="absolute -right-3 top-6 z-50">
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
  );
}
