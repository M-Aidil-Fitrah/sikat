"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Buka Dashboard",
    description: "Tekan tombol Dashboard pada menu navigasi untuk memulai",
    image: "/foto/cara-pakai/1.png",
  },
  {
    number: "02",
    title: "Tambah Laporan",
    description: "Klik tombol tambah laporan yang tersedia di dashboard",
    image: "/foto/cara-pakai/2.png",
  },
  {
    number: "03",
    title: "Unggah Foto",
    description: "Pilih ambil foto langsung atau unggah foto dari galeri",
    image: "/foto/cara-pakai/3.png",
  },
  {
    number: "04",
    title: "Isi Detail Lokasi",
    description: "Tentukan lokasi secara otomatis atau manual pada peta",
    image: "/foto/cara-pakai/4.png",
  },
  {
    number: "05",
    title: "Lengkapi Form",
    description: "Isi semua detail form laporan dengan lengkap dan akurat",
    image: "/foto/cara-pakai/5.png",
  },
  {
    number: "06",
    title: "Kirim & Tunggu",
    description: "Kirim laporan dan tunggu verifikasi dari admin",
    image: "/foto/cara-pakai/6.png",
  },
];

export default function HowToReport() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
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
      id="cara-melapor"
      ref={sectionRef}
      className="relative py-12 sm:py-14 md:py-16 bg-white overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <span className="text-red-600 text-sm font-semibold tracking-wider uppercase">
            Panduan
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Cara Melaporkan
            <br />
            <span className="text-red-600">Kejadian Bencana</span>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Ikuti langkah-langkah sederhana berikut untuk melaporkan kejadian
            bencana di sekitar Anda.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 hover:border-red-200 transition-all duration-500 hover:shadow-xl">
                {/* Image */}
                <div className="aspect-4/3 overflow-hidden bg-gray-100">
                  <motion.img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7 }}
                  />
                  {/* Number Badge */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-base sm:text-lg font-bold text-red-600">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Progress Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 w-8 h-0.5 bg-linear-to-r from-red-300 to-transparent z-10" />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 sm:mt-16 text-center"
        >
          <p className="text-gray-600 mb-6">
            Siap untuk melaporkan kejadian bencana?
          </p>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300"
            >
              Mulai Laporkan
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
