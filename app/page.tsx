"use client";

import {
  Navbar,
  HeroSection,
  HowToReport,
  Footer,
} from "./components/landing";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <HeroSection />
      <HowToReport />
      <Footer />
    </main>
  );
}
