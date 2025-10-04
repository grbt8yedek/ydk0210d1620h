import axios from 'axios';
import { logger } from '@/lib/logger';

const BASE_URL = '/api/euro-rate';

export interface ExchangeRateResponse {
  eurTry: number;
  eurUsd?: number;
  source: string;
  timestamp: string;
}

export async function getEuroRate(): Promise<number> {
  try {
    const response = await axios.get(BASE_URL);
    return response.data.eurTry || response.data.rate;
  } catch (error) {
    logger.error('Döviz kuru çekilirken hata', { error });
    return 48.50; // Hata durumunda varsayılan değer
  }
}

export async function getExchangeRates(): Promise<ExchangeRateResponse> {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    logger.error('Döviz kurları çekilirken hata', { error });
    return {
      eurTry: 48.50,
      eurUsd: 1.18,
      source: 'error',
      timestamp: new Date().toISOString()
    };
  }
} 