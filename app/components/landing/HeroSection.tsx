"use client";

import Link from "next/link";
import { motion } from "motion/react";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-linear-to-b from-slate-50 to-white">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] bg-size-[32px_32px]" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-red-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-50/50 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >

            {/* Main Title */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight"
            >
              Sistem Informasi
              <span className="block text-red-600 mt-2">
                Kebencanaan Terpadu
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Platform pelaporan dan monitoring bencana alam terintegrasi untuk 
              wilayah Aceh. Laporkan kejadian, pantau perkembangan, dan 
              koordinasikan respons bencana secara real-time.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-red-600 to-red-500 text-white text-base font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/40 hover:from-red-700 hover:to-red-600 transition-all"
              >
                Lihat Dashboard
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="mt-12 grid grid-cols-3 gap-6 lg:gap-8">
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-500 mt-1">Akses Informasi</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">23</div>
                <div className="text-sm text-gray-500 mt-1">Kabupaten/Kota</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">Live</div>
                <div className="text-sm text-gray-500 mt-1">Update Data</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Dashboard Image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative hidden lg:flex items-center justify-center scale-125"
          >
            <img
              src="/foto/dashboard-laptop.png"
              alt="Dashboard SIKAT"
              className="w-full h-auto object-contain"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
