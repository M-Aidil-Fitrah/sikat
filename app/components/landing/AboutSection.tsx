"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
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
    <section
      id="tentang"
      ref={sectionRef}
      className="relative py-16 sm:py-20 md:py-28 bg-white overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-red-50/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8">
            <motion.div variants={itemVariants}>
              <span className="text-red-600 text-sm font-semibold tracking-wider uppercase">
                Tentang SIKAT
              </span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
            >
              Informasi Bencana{" "}
              <span className="text-red-600">Terintegrasi</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-gray-600 leading-relaxed"
            >
              SIKAT membantu masyarakat melaporkan kerusakan akibat bencana alam
              secara cepat dan terverifikasi untuk respons yang lebih baik.
              Platform ini dirancang untuk meningkatkan koordinasi antara
              masyarakat, relawan, dan pihak berwenang dalam penanganan bencana.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-red-50 rounded-xl">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Real-time</p>
                  <p className="text-xs text-gray-500">Update langsung</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-red-50 rounded-xl">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Terverifikasi</p>
                  <p className="text-xs text-gray-500">Data akurat</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <motion.div variants={itemVariants} className="relative">
            <div className="relative">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-linear-to-br from-red-100 to-red-50 rounded-2xl sm:rounded-3xl rotate-2 scale-105" />
              
              {/* Dashboard Image Container */}
              <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-red-500/10 border border-gray-100 overflow-hidden">
                <div className="bg-linear-to-r from-red-600 to-red-500 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-300/50" />
                    <div className="w-3 h-3 rounded-full bg-red-300/50" />
                    <div className="w-3 h-3 rounded-full bg-red-300/50" />
                  </div>
                  <span className="text-white/80 text-xs sm:text-sm font-medium ml-2">Dashboard SIKAT</span>
                </div>
                <img
                  src="/foto/dashboard.png"
                  alt="Dashboard SIKAT Preview"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
