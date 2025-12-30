import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-red-50/30 to-orange-50/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SIKAT</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-700 hover:text-red-600 transition-colors font-medium">
                Beranda
              </Link>
              <Link href="/dashboard" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                Portal Kebencanaan Aceh
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Sistem Informasi
                <span className="block text-red-600 mt-2">Kebencanaan Terpadu</span>
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                Portal berbasis web untuk pemantauan dan pemetaan bencana banjir serta tanah longsor di wilayah Sumatera. Menyediakan informasi real-time mengenai lokasi kejadian, dampak infrastruktur, dan jumlah korban terdampak melalui partisipasi aktif masyarakat dan relawan.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/dashboard"
                  className="px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold text-center shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40"
                >
                  Lihat Peta Bencana
                </Link>
                <button className="px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold border-2 border-gray-200">
                  Laporkan Kejadian
                </button>
              </div>
            </div>

            {/* Right Content - Visual Element */}
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-linear-to-br from-red-100 via-orange-100 to-amber-100 p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="relative z-10 h-full flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">Pemetaan</h3>
                      <p className="text-sm text-gray-600">Data spasial real-time</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow mt-8">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">Partisipatif</h3>
                      <p className="text-sm text-gray-600">Laporan masyarakat</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow -mt-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">Terverifikasi</h3>
                      <p className="text-sm text-gray-600">Data akurat terpercaya</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow mt-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">Responsif</h3>
                      <p className="text-sm text-gray-600">Tanggap cepat</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">23</div>
                <div className="text-gray-600 font-medium">Kabupaten/Kota</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">Real-time</div>
                <div className="text-gray-600 font-medium">Update Data</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">24/7</div>
                <div className="text-gray-600 font-medium">Akses Informasi</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">Publik</div>
                <div className="text-gray-600 font-medium">Akses Terbuka</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Fitur Unggulan</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Platform terintegrasi untuk pemantauan banjir dan longsor di wilayah Sumatera
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-linear-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Peta Interaktif Banjir & Longsor</h3>
              <p className="text-gray-600 leading-relaxed">
                Visualisasi peta digital real-time untuk memantau lokasi banjir dan longsor, tingkat kerusakan infrastruktur, serta jumlah korban terdampak di wilayah Sumatera.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-linear-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pelaporan Partisipatif</h3>
              <p className="text-gray-600 leading-relaxed">
                Masyarakat dan relawan dapat melaporkan kejadian banjir atau longsor secara langsung dengan koordinat lokasi dan dokumentasi foto untuk respon cepat.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-linear-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Data Tervalidasi</h3>
              <p className="text-gray-600 leading-relaxed">
                Semua informasi melalui proses verifikasi untuk memastikan keakuratan data sebelum ditampilkan ke publik.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-xl font-bold">SIKAT</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Sistem Informasi Kebencanaan Terpadu untuk pemantauan banjir dan longsor di wilayah Sumatera.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Tautan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Beranda</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Kontak</h4>
              <p className="text-gray-400">
                Untuk informasi lebih lanjut, hubungi BPBD atau instansi terkait penanggulangan bencana di daerah Anda.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SIKAT - Sistem Informasi Kebencanaan Terpadu Aceh</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
