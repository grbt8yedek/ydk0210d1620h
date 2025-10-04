import { NextResponse } from 'next/server';
import axios from 'axios';
import { logger } from '@/lib/logger';

// Cache sistemi - 5 dakika boyunca sakla
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

export async function GET() {
  try {
    // Cache kontrolü
    const cacheKey = 'euro-rate';
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.debug('Cache\'den döviz kuru döndürülüyor');
      return NextResponse.json(cached.data);
    }

    // Gerçek zamanlı döviz kuru için farklı API'ler - paralel çağrı
    const apis = [
      'https://api.frankfurter.app/latest?from=EUR&to=TRY,USD',
      'https://api.exchangerate-api.com/v4/latest/EUR',
      'https://api.ratesapi.io/api/latest?base=EUR&symbols=TRY,USD'
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
        logger.warn(`API hatası (${apiUrl})`, { error: errorMessage });
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
          logger.info(`Döviz kuru başarıyla alındı`, { rate: responseData.eurTry, source: result.value.apiUrl });
          
          // Cache'e kaydet
          cache.set(cacheKey, {
            data: responseData,
            timestamp: Date.now()
          });
        
          return NextResponse.json(responseData);
        }
      }
    }

    // Tüm API'ler başarısız olursa fallback
    logger.warn('Tüm API\'ler başarısız, fallback değer kullanılıyor');
    const fallbackData = { 
      eurTry: 48.50,
      eurUsd: 1.18,
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
    logger.error('Euro kuru çekilemedi', { error });
    const errorData = { 
      eurTry: 48.50,
      eurUsd: 1.18,
      source: 'error',
      timestamp: new Date().toISOString()
    };
    
    // Error'u da cache'e kaydet (kısa süre)
    const cacheKey = 'euro-rate';
    cache.set(cacheKey, {
      data: errorData,
      timestamp: Date.now()
    });
    
    return NextResponse.json(errorData);
  }
}