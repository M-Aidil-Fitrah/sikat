import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIKAT - Sistem Informasi Kebencanaan Terpadu",
  description: "Portal berbasis web untuk mendukung penyediaan informasi kebencanaan di wilayah Aceh secara terintegrasi dan berbasis spasial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  );
}
