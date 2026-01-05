"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        className={`max-w-6xl mx-auto rounded-2xl transition-all duration-500 ${
          scrolled
            ? "bg-white/70 backdrop-blur-2xl shadow-xl shadow-black/10 border border-white/20"
            : "bg-white/60 backdrop-blur-xl border border-white/20"
        }`}
      >
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                src="/logo-satgas-usk.png"
                alt="Logo SATGAS USK"
                className="h-10 w-auto"
              />
              <div className="hidden sm:block">
                <span className="text-base font-bold tracking-tight text-gray-900">
                  SATGAS USK - SIKAT
                </span>
                <p className="text-[9px] uppercase tracking-[0.15em] text-gray-500">
                  Sistem Informasi Kebencanaan Terpadu
                </p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Beranda
              </Link>
              <Link
                href="#tentang"
                className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Tentang
              </Link>
              <Link
                href="#fitur"
                className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Fitur
              </Link>
              <Link
                href="#galeri"
                className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Galeri
              </Link>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="ml-2">
                <Link
                  href="/dashboard"
                  className="px-5 py-2 bg-linear-to-r from-red-600 to-red-500 text-white text-sm font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
                >
                  Dashboard
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                <Link
                  href="/"
                  className="block px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Beranda
                </Link>
                <Link
                  href="#tentang"
                  className="block px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tentang
                </Link>
                <Link
                  href="#fitur"
                  className="block px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Fitur
                </Link>
                <Link
                  href="#galeri"
                  className="block px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Galeri
                </Link>
                <Link
                  href="/dashboard"
                  className="block w-full text-center py-3 bg-linear-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
