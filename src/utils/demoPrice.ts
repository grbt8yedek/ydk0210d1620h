import { addDays, subDays } from 'date-fns';
import { logger } from '@/lib/logger';

export function getDemoPrices(baseDate: Date, currency: string = "EUR") {
  // baseDate geçerli değilse bugünkü tarihi kullan
  const safeBaseDate = (baseDate instanceof Date && !isNaN(baseDate.getTime())) ? baseDate : new Date();
  return Array.from({ length: 10 }, (_, i) => {
    const date = addDays(subDays(safeBaseDate, 3), i);
    const price = 90 + Math.floor(Math.abs(Math.sin(date.getTime() / 1e9)) * 60);
    return {
      date,
      price,
      currency,
    };
  });
}

export async function fetchPricesFromAPI(origin: string, destination: string, baseDate: Date, currency: string = "EUR") {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const demo = getDemoPrices(baseDate, currency);
    if (!demo || demo.length === 0) throw new Error('Demo veri boş');
    return demo;
  } catch (error) {
    logger.error('Fiyat çekme hatası', { error });
    // Hata durumunda demo veri döndür
    return getDemoPrices(baseDate, currency);
  }
} 