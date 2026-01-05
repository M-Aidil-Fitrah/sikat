"use client";

import Link from "next/link";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: "-50px" });

  const currentYear = new Date().getFullYear();

  return (
    <footer ref={footerRef} className="relative overflow-hidden">
      {/* Top Border - Black gradient (thick center to thin edges) */}
      <div className="h-px bg-linear-to-r from-transparent via-black to-transparent" />

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] bg-size-[32px_32px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
          className="py-12 sm:py-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12"
        >
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="p-2 bg-gray-100 rounded-xl">
                <img
                  src="/logo-satgas-usk.png"
                  alt="Logo SATGAS USK"
                  className="h-10 w-auto"
                />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">SATGAS USK - SIKAT</span>
                <p className="text-xs text-gray-600 tracking-wider">
                  Sistem Kebencanaan Terpadu
                </p>
              </div>
            </Link>
            <p className="text-gray-600 leading-relaxed text-sm max-w-xs">
              Platform pelaporan dan monitoring bencana alam terintegrasi untuk
              wilayah Aceh dan sekitarnya.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6">
              Navigasi
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-red-600 transition-colors duration-300 text-sm"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-red-600 transition-colors duration-300 text-sm"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="#fitur"
                  className="text-gray-600 hover:text-red-600 transition-colors duration-300 text-sm"
                >
                  Fitur
                </Link>
              </li>
              <li>
                <Link
                  href="#galeri"
                  className="text-gray-600 hover:text-red-600 transition-colors duration-300 text-sm"
                >
                  Galeri
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6">
              Kontak
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-gray-900 font-semibold text-sm mb-2">Sekretariat SATGAS USK</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Gedung Tsunami and Disaster Mitigation Research Center (TDMRC) Lantai 1, Universitas Syiah Kuala.
                </p>
              </div>
              
              <div>
                <p className="text-gray-900 font-semibold text-sm mb-1">Call Center</p>
                <p className="text-gray-600 text-sm">0851 2229 6004</p>
              </div>
              
              <div>
                <p className="text-gray-900 font-semibold text-sm mb-1">Email</p>
                <a href="mailto:satgas-senyar@usk.ac.id" className="text-red-600 hover:text-red-700 text-sm transition-colors">
                  satgas-senyar@usk.ac.id
                </a>
              </div>
              
              <div>
                <p className="text-gray-900 font-semibold text-sm mb-1">Alamat</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Jalan Hamzah Fansuri No. 8, Kopelma Darussalam, Banda Aceh, Indonesia
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="py-6 border-t border-gray-200"
        >
          <p className="text-gray-500 text-sm text-center">
            &copy; {currentYear} SIKAT - Sistem Informasi Kebencanaan Terpadu Aceh
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
