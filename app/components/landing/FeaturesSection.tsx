"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

const features = [
  {
    title: "Pelaporan Lokasi Bencana",
    description:
      "Laporkan kejadian bencana dengan titik koordinat yang akurat melalui GPS atau pemilihan lokasi manual pada peta interaktif.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    title: "Verifikasi Admin Real-time",
    description:
      "Setiap laporan diverifikasi oleh tim admin untuk memastikan keakuratan informasi sebelum ditampilkan ke publik.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    title: "Monitoring Data Bencana",
    description:
      "Pantau perkembangan bencana melalui dashboard interaktif dengan visualisasi peta dan data statistik terkini.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    title: "Respons Tanggap Darurat",
    description:
      "Koordinasi cepat antara masyarakat, relawan, dan instansi terkait untuk penanganan bencana yang lebih efektif.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
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
      id="fitur"
      ref={sectionRef}
      className="relative py-16 sm:py-20 md:py-28 bg-linear-to-b from-gray-50 to-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] bg-size-[40px_40px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <span className="text-red-600 text-sm font-semibold tracking-wider uppercase">
            Fitur Utama
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Solusi Lengkap untuk
            <br />
            <span className="text-red-600">Pelaporan Bencana</span>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Fitur-fitur yang dirancang untuk memudahkan pelaporan dan monitoring
            bencana alam di wilayah Anda.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              <div className="relative h-full p-6 sm:p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:border-red-200">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 mb-5 sm:mb-6 rounded-xl bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20"
                >
                  {feature.icon}
                </motion.div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {feature.description}
                </p>

                {/* Hover Gradient */}
                <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-red-50 to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
