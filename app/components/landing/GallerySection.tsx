"use client";

import { motion, useInView } from "motion/react";
import { useRef, useMemo } from "react";
import dynamic from "next/dynamic";

// Dynamic import Masonry to avoid SSR issues
const Masonry = dynamic(() => import("../Masonry"), { ssr: false });

// Gallery images from public/foto folder
const galleryImages = [
  { id: "1", img: "/foto/1.jpg", url: "#", height: 400 },
  { id: "2", img: "/foto/2.jpg", url: "#", height: 500 },
  { id: "3", img: "/foto/3.jpg", url: "#", height: 350 },
  { id: "4", img: "/foto/4.JPG", url: "#", height: 450 },
  { id: "5", img: "/foto/IMG_1749.JPG", url: "#", height: 400 },
  { id: "6", img: "/foto/IMG_1785.jpg", url: "#", height: 500 },
  { id: "7", img: "/foto/IMG_1974.JPG", url: "#", height: 380 },
  { id: "8", img: "/foto/IMG_5987.JPG", url: "#", height: 450 },
  { id: "9", img: "/foto/IMG_7531.jpg", url: "#", height: 420 },
  { id: "10", img: "/foto/IMG_7535.jpg", url: "#", height: 480 },
  { id: "11", img: "/foto/IMG_7538.jpg", url: "#", height: 400 },
  { id: "12", img: "/foto/1.jpg", url: "#", height: 340 },
  { id: "13", img: "/foto/3.jpg", url: "#", height: 340 },
  { id: "14", img: "/foto/IMG_1785.jpg", url: "#", height: 320 },
  { id: "15", img: "/foto/IMG_7531.jpg", url: "#", height: 210 },
];

export default function GallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Calculate total height for masonry container
  const masonryHeight = useMemo(() => {
    // Approximate height calculation based on items
    const totalHeight = galleryImages.reduce((acc, img) => acc + img.height / 2, 0);
    return Math.ceil(totalHeight / 3) - 150; // Divide by approximate columns and reduce extra space
  }, []);

  return (
    <section
      id="galeri"
      ref={sectionRef}
      className="relative pt-12 sm:pt-14 md:pt-16 pb-0 bg-linear-to-b from-white to-gray-50 overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
          className="text-center mb-12"
        >
          <span className="text-red-600 text-sm font-semibold tracking-wider uppercase">
            Dokumentasi
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Realitas di
            <span className="text-red-600"> Lapangan</span>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Dokumentasi visual dari berbagai kejadian bencana yang telah dilaporkan
            melalui platform SIKAT.
          </p>
        </motion.div>

        {/* Masonry Gallery */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
          style={{ height: `${masonryHeight}px` }}
        >
          <Masonry
            items={galleryImages}
            ease="power3.out"
            duration={0.6}
            stagger={0.04}
            animateFrom="bottom"
            scaleOnHover={true}
            hoverScale={0.97}
            blurToFocus={true}
            colorShiftOnHover={false}
          />
        </motion.div>
      </div>
    </section>
  );
}
