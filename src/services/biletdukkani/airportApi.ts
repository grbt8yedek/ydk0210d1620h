// BiletDukkani Havalimanı Arama API'leri
import { Airport } from '@/types/flight';

// Havalimanı arama fonksiyonu (demo ve gerçek API)
export async function searchAirports(query: string): Promise<Airport[]> {
  const API_KEY = process.env.NEXT_PUBLIC_FLIGHT_API_KEY;
  
  // Demo veri (API anahtarı olmadığında kullanılır)
  const demoAirports: Airport[] = [
    { code: 'IST', name: 'İstanbul Havalimanı', city: 'İstanbul' },
    { code: 'SAW', name: 'Sabiha Gökçen', city: 'İstanbul' },
    { code: 'ESB', name: 'Esenboğa Havalimanı', city: 'Ankara' },
    { code: 'ADB', name: 'Adnan Menderes Havalimanı', city: 'İzmir' },
    { code: 'AYT', name: 'Antalya Havalimanı', city: 'Antalya' },
    { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam' },
    { code: 'FRA', name: 'Frankfurt Havalimanı', city: 'Frankfurt' },
    { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris' },
  ];

  // API anahtarı yoksa demo veri döndür
  if (!API_KEY) {
    return demoAirports.filter(airport => 
      airport.name.toLowerCase().includes(query.toLowerCase()) ||
      airport.city.toLowerCase().includes(query.toLowerCase()) ||
      airport.code.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Gerçek API çağrısı (şu an aktif değil)
  try {
    const response = await fetch(`https://api.flightapi.io/airports?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Havalimanı arama API hatası');
    }
    
    const data = await response.json();
    return data.airports || [];
  } catch (error) {
    console.error('Havalimanı arama hatası:', error);
    // Hata durumunda demo veri döndür
    return demoAirports.filter(airport => 
      airport.name.toLowerCase().includes(query.toLowerCase()) ||
      airport.city.toLowerCase().includes(query.toLowerCase()) ||
      airport.code.toLowerCase().includes(query.toLowerCase())
    );
  }
} 