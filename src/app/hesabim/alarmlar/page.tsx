'use client';

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, ArrowRight, Calendar, Trash2, Plus } from 'lucide-react';
import Footer from '@/components/Footer';

export default function AlarmlarPage() {
  const { data: session, status } = useSession();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogout = () => { signOut({ callbackUrl: '/' }); };

  useEffect(() => {
    if (status === "authenticated") {
      fetchAlerts();
    } else if (status === "unauthenticated") {
      router.push("/giris");
    }
  }, [status]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/price-alerts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu");
      setAlerts(data.alerts);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu fiyat alarmını silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/price-alerts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi");
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      alert("Silme işlemi başarısız oldu");
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* <AccountSidebar items={menuItems} onLogout={handleLogout} /> */}
            <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="sm:container sm:mx-auto sm:px-4 sm:py-8 container mx-auto px-2 py-4">
        <div className="sm:flex sm:gap-8 flex flex-col gap-2">
          {/* <AccountSidebar items={menuItems} onLogout={handleLogout} /> */}
          <div className="flex-1 bg-white rounded-lg shadow-sm sm:p-6 p-2">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Bell className="w-6 h-6 text-gray-400" />
                <h1 className="sm:text-2xl text-lg font-bold text-gray-800">Fiyat Alarmlarım</h1>
              </div>
              <button
                onClick={() => router.push('/flights/search')}
                className="sm:px-4 sm:py-2 px-2 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2 text-xs sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Alarm Ekle</span>
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aktif fiyat alarmınız bulunmamaktadır.
              </div>
            ) : (
              <div className="sm:space-y-4 space-y-2">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className="border rounded-lg sm:p-4 p-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm text-gray-500">Nereden</span>
                            <span className="font-medium text-xs sm:text-base">{alert.origin}</span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm text-gray-500">Nereye</span>
                            <span className="font-medium text-xs sm:text-base">{alert.destination}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm text-gray-500">Tarih</span>
                            <span className="font-medium text-xs sm:text-base">
                              {new Date(alert.departureDate).toLocaleDateString("tr-TR")}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm text-gray-500">Hedef Fiyat</span>
                          <span className="font-medium text-xs sm:text-base text-orange-600">
                            {alert.targetPrice ? `${alert.targetPrice} EUR` : 'Belirtilmemiş'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm text-gray-500">Oluşturulma</span>
                          <span className="font-medium text-xs sm:text-sm">
                            {new Date(alert.createdAt).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => router.push(`/flights/search?from=${alert.origin}&to=${alert.destination}&date=${new Date(alert.departureDate).toISOString().split('T')[0]}`)}
                          className="sm:px-4 sm:py-2 px-2 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-xs sm:text-base"
                        >
                          Uçuşları Gör
                        </button>
                        <button 
                          onClick={() => handleDelete(alert.id)}
                          className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 sm:mt-6 p-2 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">
                Fiyat alarmı oluşturduğunuzda, belirlediğiniz fiyata ulaşıldığında size bildirim göndereceğiz.
                Dilediğiniz zaman alarmlarınızı düzenleyebilir veya silebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
} 