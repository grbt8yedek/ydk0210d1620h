"use client";
import { useState } from "react";

export default function DebugBinPage() {
  const [cardNumber, setCardNumber] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testBin = async () => {
    if (cardNumber.length < 6) return;
    
    setLoading(true);
    try {
      // GÜVENLİ: POST body ile kart numarasını gönder
      const response = await fetch('/api/payment/bin-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardNumber: cardNumber,
          price: 95,
          productType: 'flight',
          currencyCode: 'EUR'
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">BIN API Debug</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Kart Numarası (en az 6 hane)</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
              className="w-full p-2 border rounded"
              placeholder="415565..."
            />
          </div>
          
          <button
            onClick={testBin}
            disabled={cardNumber.length < 6 || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            {loading ? 'Test ediliyor...' : 'BIN Bilgisi Al'}
          </button>
          
          {result && (
            <div className="mt-6">
              <h3 className="font-bold mb-2">Sonuç:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="font-bold mb-2">Test Kartları:</h3>
            <div className="space-y-2">
              <button
                onClick={() => setCardNumber("415565")}
                className="block text-left p-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                415565 - QNB Finansbank (3D Secure, Direkt Ödeme)
              </button>
              <button
                onClick={() => setCardNumber("435508")}
                className="block text-left p-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                435508 - Akbank (3D Secure, Direkt Ödeme)
              </button>
              <button
                onClick={() => setCardNumber("402277")}
                className="block text-left p-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                402277 - Vakıfbank (3D Ödeme Gerekli)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 