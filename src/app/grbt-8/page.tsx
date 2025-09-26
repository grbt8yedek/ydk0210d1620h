import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function GRBT8Dashboard() {
  const bypass = (process.env.ADMIN_BYPASS || '').toLowerCase() === 'true';
  const session = await getServerSession(authOptions);
  const allow = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  if (!bypass && (!session || !session.user?.email || (allow.length && !allow.includes(session.user.email.toLowerCase())))) {
    redirect('/grbt-8/giris');
  }
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

    </div>
  );
}


