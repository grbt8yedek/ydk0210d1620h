// Ortak API fonksiyonları - tekrarlayan kod'u önlemek için
export class ApiClient {
  private static baseUrl = '/api';
  
  static async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
  static async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
  static async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
  static async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
}

// Ortak API endpoint'leri
export const API_ENDPOINTS = {
  CAMPAIGNS: '/campaigns',
  SURVEY: '/survey',
  USER_PROFILE: '/user/profile',
  USER_UPDATE: '/user/update',
  PASSENGERS: '/passengers',
  RESERVATIONS: '/reservations',
  PRICE_ALERTS: '/price-alerts',
  SEARCH_FAVORITES: '/search-favorites',
  AGENCY_BALANCE: '/agency-balance/detail',
  REPORTS_SALES: '/reports/sales',
  PAYMENT_BIN_INFO: '/payment/bin-info',
  EURO_RATE: '/euro-rate',
  LOOKUPS_PROVIDERS: '/lookups/providers'
} as const;
