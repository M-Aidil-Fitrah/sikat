import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-20">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800">SIKAT</span>
          </Link>
        </div>
        
        <nav className="px-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-red-600 bg-red-50 rounded-xl font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Peta Bencana
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Laporan
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Lokasi Bencana
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Infrastruktur
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Data Korban
          </a>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500">Ringkasan data kebencanaan wilayah Aceh</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Laporan
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Kejadian", value: "127", change: "+12%", icon: "🔴", color: "red" },
            { label: "Jiwa Terdampak", value: "3,456", change: "+8%", icon: "👥", color: "blue" },
            { label: "Infrastruktur Rusak", value: "234", change: "+15%", icon: "🏠", color: "orange" },
            { label: "Laporan Terverifikasi", value: "98", change: "+5%", icon: "✅", color: "green" },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{stat.icon}</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stat.color === "red" ? "bg-red-100 text-red-600" :
                  stat.color === "blue" ? "bg-blue-100 text-blue-600" :
                  stat.color === "orange" ? "bg-orange-100 text-orange-600" :
                  "bg-green-100 text-green-600"
                }`}>{stat.change}</span>
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</div>
              <div className="text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Placeholder */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Peta Sebaran Bencana</h2>
              <p className="text-slate-500 text-sm">Visualisasi lokasi kejadian bencana di Aceh</p>
            </div>
            <div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-20 h-20 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-slate-500 font-medium">Peta Interaktif</p>
                <p className="text-slate-400 text-sm">Leaflet Map akan ditampilkan di sini</p>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Laporan Terkini</h2>
              <p className="text-slate-500 text-sm">Kejadian bencana terbaru</p>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { type: "Banjir", location: "Banda Aceh", time: "2 jam lalu", severity: "high" },
                { type: "Longsor", location: "Aceh Tengah", time: "5 jam lalu", severity: "medium" },
                { type: "Kebakaran", location: "Lhokseumawe", time: "1 hari lalu", severity: "low" },
                { type: "Banjir", location: "Aceh Utara", time: "2 hari lalu", severity: "high" },
                { type: "Angin Kencang", location: "Pidie", time: "3 hari lalu", severity: "medium" },
              ].map((report, index) => (
                <div key={index} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      report.severity === "high" ? "bg-red-500" :
                      report.severity === "medium" ? "bg-yellow-500" :
                      "bg-green-500"
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{report.type}</div>
                      <div className="text-sm text-slate-500">{report.location}</div>
                    </div>
                    <div className="text-xs text-slate-400">{report.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100">
              <button className="w-full text-center text-red-600 font-medium hover:text-red-700 transition-colors">
                Lihat Semua Laporan →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Disaster Types Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Jenis Bencana</h2>
            <div className="space-y-4">
              {[
                { type: "Banjir", count: 45, percentage: 35, color: "bg-blue-500" },
                { type: "Longsor", count: 32, percentage: 25, color: "bg-orange-500" },
                { type: "Kebakaran", count: 28, percentage: 22, color: "bg-red-500" },
                { type: "Angin Kencang", count: 22, percentage: 18, color: "bg-teal-500" },
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">{item.type}</span>
                    <span className="text-slate-800 font-medium">{item.count} kejadian</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Affected Areas */}
          <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Wilayah Terdampak</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Banda Aceh", incidents: 23, status: "high" },
                { name: "Aceh Besar", incidents: 18, status: "medium" },
                { name: "Pidie", incidents: 15, status: "medium" },
                { name: "Aceh Utara", incidents: 12, status: "low" },
                { name: "Lhokseumawe", incidents: 10, status: "low" },
                { name: "Aceh Tengah", incidents: 8, status: "low" },
              ].map((area, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${
                      area.status === "high" ? "bg-red-500" :
                      area.status === "medium" ? "bg-yellow-500" :
                      "bg-green-500"
                    }`} />
                    <span className="font-medium text-slate-800">{area.name}</span>
                  </div>
                  <div className="text-sm text-slate-500">{area.incidents} kejadian</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
