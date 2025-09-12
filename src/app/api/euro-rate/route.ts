import { NextResponse } from 'next/server';
import axios from 'axios';

// Cache sistemi - 5 dakika boyunca sakla
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

export async function GET() {
  try {
    // Cache kontrolü
    const cacheKey = 'euro-rate';
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Cache\'den döviz kuru döndürülüyor');
      return NextResponse.json(cached.data);
    }

    // Gerçek zamanlı döviz kuru için farklı API'ler - paralel çağrı
    const apis = [
      'https://api.exchangerate.host/latest?base=EUR&symbols=TRY,USD',
      'https://api.frankfurter.app/latest?from=EUR&to=TRY,USD',
      'https://api.currencyapi.com/v3/latest?apikey=YOUR_API_KEY&currencies=TRY,USD&base_currency=EUR'
    ];

    // Paralel API çağrıları - Promise.allSettled kullan
    const promises = apis.map(async (apiUrl) => {
      try {
        const response = await axios.get(apiUrl, { timeout: 2000 }); // Timeout 2 saniye
        let eurTryRate = null;
        let eurUsdRate = null;

        // Farklı API formatlarını kontrol et
        if (response.data?.rates?.TRY) {
          eurTryRate = response.data.rates.TRY;
        } else if (response.data?.quotes?.EURTRY) {
          eurTryRate = response.data.quotes.EURTRY;
        } else if (response.data?.data?.TRY) {
          eurTryRate = response.data.data.TRY;
        } else if (response.data?.rates?.EURTRY) {
          eurTryRate = response.data.rates.EURTRY;
        }

        if (response.data?.rates?.USD) {
          eurUsdRate = response.data.rates.USD;
        } else if (response.data?.quotes?.EURUSD) {
          eurUsdRate = response.data.quotes.EURUSD;
        } else if (response.data?.data?.USD) {
          eurUsdRate = response.data.data.USD;
        }

        if (eurTryRate && eurTryRate > 0) {
          return {
            success: true,
            data: {
              eurTry: parseFloat(eurTryRate.toFixed(2)),
              eurUsd: eurUsdRate ? parseFloat(eurUsdRate.toFixed(2)) : null,
              source: 'live',
              timestamp: new Date().toISOString()
            },
            apiUrl
          };
        }
        return { success: false, apiUrl };
      } catch (apiError) {
        const errorMessage = apiError instanceof Error ? apiError.message : 'Bilinmeyen hata';
        console.log(`API hatası (${apiUrl}):`, errorMessage);
        return { success: false, apiUrl };
      }
    });

    // Tüm API'leri paralel çağır
    const results = await Promise.allSettled(promises);
    
    // İlk başarılı sonucu bul
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        const responseData = result.value.data;
        if (responseData && responseData.eurTry) {
          console.log(`Döviz kuru başarıyla alındı: €1 = ${responseData.eurTry} TL (${result.value.apiUrl})`);
          
          // Cache'e kaydet
          cache.set(cacheKey, {
            data: responseData,
            timestamp: Date.now()
          });
        
        return NextResponse.json(responseData);
      }
    }

    // Tüm API'ler başarısız olursa fallback
    console.log('Tüm API\'ler başarısız, fallback değer kullanılıyor');
    const fallbackData = { 
      eurTry: 35.50,
      eurUsd: 1.08,
      source: 'fallback',
      timestamp: new Date().toISOString()
    };
    
    // Fallback'i de cache'e kaydet (kısa süre)
    cache.set(cacheKey, {
      data: fallbackData,
      timestamp: Date.now()
    });
    
    return NextResponse.json(fallbackData);

  } catch (error) {
    console.error('Euro kuru çekilemedi:', error);
    const errorData = { 
      eurTry: 35.50,
      eurUsd: 1.08,
      source: 'error',
      timestamp: new Date().toISOString()
    };
    
    // Error'u da cache'e kaydet (kısa süre)
    cache.set(cacheKey, {
      data: errorData,
      timestamp: Date.now()
    });
    
    return NextResponse.json(errorData);
  }
} 