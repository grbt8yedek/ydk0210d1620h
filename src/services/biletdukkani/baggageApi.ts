// BiletDukkani Bagaj API'leri

// POST /flights/fare-extra-baggage demo fonksiyonu
export async function addExtraBaggageBiletDukkaniDemo(params: {
  fareExtraBaggages: {
    fareId: string;
    flightId: string;
    extraBaggageId: string;
    passengerIndex: number;
    passengerType: string;
  }[]
}) {
  // Demo amaçlı, başarılı bir ek bagaj işlemi simüle eder
  return {
    success: true,
    message: 'Ekstra bagaj başarıyla eklendi (DEMO)',
    request: params
  };
}

// POST /flights/fare-extra-baggage gerçek API fonksiyonu (hazırlık, canlıda aktif edilecek)
export async function addExtraBaggageBiletDukkaniReal(params: {
  fareExtraBaggages: {
    fareId: string;
    flightId: string;
    extraBaggageId: string;
    passengerIndex: number;
    passengerType: string;
  }[]
}, token: string) {
  // Gerçek API entegrasyonu için örnek (şu an aktif değil)
  const response = await fetch('https://test-api.biletdukkani.com/flights/fare-extra-baggage/' + params.fareExtraBaggages[0].fareId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    throw new Error('Ekstra bagaj eklenemedi: ' + response.statusText);
  }
  // API response'u genellikle boştur, sadece başarılı/başarısız kontrol edilir
  return { success: true };
} 