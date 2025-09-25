export default function GRBT8Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        GRBT-8 Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Raporlar Kartı */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            📊 Satış Raporları
          </h2>
          <p className="text-gray-600 mb-4">
            Detaylı satış analizleri ve performans metrikleri
          </p>
          <a 
            href="/grbt-8/raporlar" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Raporları Görüntüle
          </a>
        </div>

        {/* Kampanyalar Kartı */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            🎯 Kampanya Yönetimi
          </h2>
          <p className="text-gray-600 mb-4">
            Banner kampanyaları ve promosyon yönetimi
          </p>
          <a 
            href="/grbt-8/kampanyalar" 
            className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Kampanyaları Yönet
          </a>
        </div>

        {/* Monitor Kartı */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            🔍 Sistem İzleme
          </h2>
          <p className="text-gray-600 mb-4">
            Performans metrikleri ve güvenlik durumu
          </p>
          <a 
            href="/grbt-8/monitor" 
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Sistemi İzle
          </a>
        </div>
      </div>

      {/* Hızlı İstatistikler */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Hızlı İstatistikler
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">--</div>
            <div className="text-sm text-gray-600">Toplam Kullanıcı</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">--</div>
            <div className="text-sm text-gray-600">Aktif Kampanya</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">--</div>
            <div className="text-sm text-gray-600">Sistem Durumu</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">--</div>
            <div className="text-sm text-gray-600">Güvenlik Skoru</div>
          </div>
        </div>
      </div>
    </div>
  );
}


