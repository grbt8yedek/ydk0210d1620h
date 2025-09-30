// BiletDukkani Havalimanı Arama API'leri
import { Airport } from '@/types/flight';

// Havalimanı arama fonksiyonu - SERVER-SIDE PROXY KULLAN (güvenli)
export async function searchAirports(query: string): Promise<Airport[]> {
  // Demo veri (fallback)
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

  // Server-side proxy üzerinden API çağrısı (API key gizli kalır)
  try {
    const response = await fetch(`/api/airports/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error('Airport API hatası');
    }
    
    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      return data.data;
    }
    
    // API başarısız olursa demo veri döndür
    return demoAirports.filter(airport => 
      airport.name.toLowerCase().includes(query.toLowerCase()) ||
      airport.city.toLowerCase().includes(query.toLowerCase()) ||
      airport.code.toLowerCase().includes(query.toLowerCase())
    );
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
