"use client";

import {
  Navbar,
  HeroSection,
  AboutSection,
  FeaturesSection,
  HowToReport,
  GallerySection,
  Footer,
} from "./components/landing";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <HowToReport />
      <GallerySection />
      <Footer />
    </main>
  );
}
