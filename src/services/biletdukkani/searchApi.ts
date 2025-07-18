// BiletDukkani Uçuş Arama API'leri

// POST /flights/search demo fonksiyonu
export async function searchFlightsBiletDukkaniDemoPost(params: {
  OriginCode: string;
  OriginType: string;
  DestinationCode: string;
  DestinationType: string;
  DepartDate: string;
  ReturnDate?: string;
  Adults: string;
  Children?: string;
  SeniorCitizens?: string;
  Militaries?: string;
  Infants?: string;
}) {
  // Demo amaçlı, parametrelere göre örnek uçuş verisi döndürür
  return [
    {
      id: 1,
      airlineName: 'Turkish Airlines',
      flightNumber: 'TK123',
      origin: params.OriginCode,
      destination: params.DestinationCode,
      departureTime: `${params.DepartDate}T09:00:00`,
      arrivalTime: `${params.DepartDate}T10:20:00`,
      duration: '1s 20d',
      price: 120,
      direct: true,
      baggage: '15 kg',
      currency: 'EUR',
      passengers: params.Adults,
    },
    {
      id: 2,
      airlineName: 'SunExpress',
      flightNumber: 'XQ456',
      origin: params.OriginCode,
      destination: params.DestinationCode,
      departureTime: `${params.DepartDate}T13:00:00`,
      arrivalTime: `${params.DepartDate}T14:30:00`,
      duration: '1s 30d',
      price: 99,
      direct: false,
      baggage: '20 kg',
      currency: 'EUR',
      passengers: params.Adults,
    }
  ];
}

// POST /flights/fare demo fonksiyonu
export async function fareFlightsBiletDukkaniDemo(params: {
  adults: number;
  children: number;
  infants: number;
  students?: number;
  disabledPersons?: number;
  flightBrandList: { flightId: string; brandId: string }[];
}) {
  // Demo amaçlı, parametrelere göre örnek fiyatlandırma verisi döndürür
  return {
    fareIds: ["demo-fare-id-12345"],
    flights: params.flightBrandList.map((item, idx) => ({
      selectedBrand: {
        id: item.brandId,
        name: `Demo Brand ${idx + 1}`
      },
      price: 120 + idx * 10,
      currency: 'EUR'
    }))
  };
}

// GET /flights/fare/:fareIds demo fonksiyonu
export async function getFareDetailsBiletDukkaniDemo(fareIds: string) {
  // Demo amaçlı, fareIds parametresine göre örnek fare detayları döndürür
  return {
    fareId: fareIds,
    flights: [
      {
        flightId: "demo-flight-123",
        brandId: "demo-brand-456",
        selectedBrand: {
          id: "demo-brand-456",
          name: "Demo Economy Class"
        },
        price: 150,
        currency: 'EUR',
        baggage: '20 kg',
        cabinClass: 'Economy',
        fareRules: {
          cancellation: 'İade edilemez',
          change: 'Değişiklik ücreti: 50 EUR',
          refund: 'İade edilemez'
        }
      }
    ],
    totalPrice: 150,
    currency: 'EUR',
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 saat geçerli
    bookingClass: 'Y',
    fareType: 'Public'
  };
}

// GET /flights/air-rules demo fonksiyonu
export async function getAirRulesBiletDukkaniDemo(params: {
  fareId: string;
  flightId: string;
  brandId: string;
}) {
  // Demo amaçlı, örnek kural verisi döndürür
  return [
    { title: 'Bagaj Kuralları', detail: 'Her yolcu için 20kg bagaj dahildir. Ekstra bagaj ücretlidir.' },
    { title: 'İade/Değişiklik', detail: 'İade edilemez, değişiklik ücreti 50 EUR.' },
    { title: 'Check-in', detail: 'Online check-in uçuş saatinden 24 saat önce başlar.' }
  ];
}

// GET /flights/air-rules gerçek API fonksiyonu (hazırlık, canlıda aktif edilecek)
export async function getAirRulesBiletDukkaniReal(params: {
  fareId: string;
  flightId: string;
  brandId: string;
}, token: string) {
  const url = `https://test-api.biletdukkani.com/flights/air-rules?FareId=${params.fareId}&FlightId=${params.flightId}&BrandId=${params.brandId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Kural bilgisi alınamadı: ' + response.statusText);
  }
  const data = await response.json();
  return data.data || [];
} 