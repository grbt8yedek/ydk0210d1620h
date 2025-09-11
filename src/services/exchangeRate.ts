import axios from 'axios';

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
    console.error('Döviz kuru çekilirken hata oluştu:', error);
    return 44.50; // Hata durumunda varsayılan değer
  }
}

export async function getExchangeRates(): Promise<ExchangeRateResponse> {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Döviz kurları çekilirken hata oluştu:', error);
    return {
      eurTry: 44.50,
      eurUsd: 1.08,
      source: 'error',
      timestamp: new Date().toISOString()
    };
  }
} 