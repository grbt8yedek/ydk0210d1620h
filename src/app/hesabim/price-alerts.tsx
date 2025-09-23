"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PriceAlertsPage() {
  const { data: session, status } = useSession();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      fetchAlerts();
    } else if (status === "unauthenticated") {
      router.push("/giris");
    }
  }, [status, router]);

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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-700">Fiyat Alarmlarım</h2>
      {loading ? (
        <div className="text-gray-400">Yükleniyor...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : alerts.length === 0 ? (
        <div className="text-gray-500">Hiç fiyat alarmınız yok.</div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50">
              <div>
                <div className="font-semibold text-green-700">{alert.origin} → {alert.destination}</div>
                <div className="text-sm text-gray-500">{new Date(alert.departureDate).toLocaleDateString("tr-TR")} • {alert.targetPrice} EUR</div>
                <div className="text-xs text-gray-400">Oluşturulma: {new Date(alert.createdAt).toLocaleString("tr-TR")}</div>
              </div>
              <button
                className="mt-2 md:mt-0 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                onClick={() => handleDelete(alert.id)}
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 