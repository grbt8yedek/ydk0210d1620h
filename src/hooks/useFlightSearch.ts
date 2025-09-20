import { useQuery, useMutation } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/queryClient'

interface FlightSearchParams {
  from: string
  to: string
  departureDate: string
  returnDate?: string
  passengers: {
    adults: number
    children: number
    infants: number
  }
  tripType: 'oneWay' | 'roundTrip'
}

interface FlightSearchResult {
  flights: any[]
  totalResults: number
  searchId: string
}

// Flight search API call
async function searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
  const response = await fetch('/api/flights/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  
  if (!response.ok) {
    throw new Error('Uçuş arama hatası')
  }
  
  return response.json()
}

export function useFlightSearch() {
  return useMutation({
    mutationFn: searchFlights,
    onSuccess: (data, variables) => {
      // Başarılı arama sonucunu cache'le
      const cacheKey = [
        QUERY_KEYS.FLIGHT_SEARCH,
        variables.from,
        variables.to,
        variables.departureDate,
        variables.returnDate,
        variables.passengers,
      ]
      
      // Query client'a manuel cache ekleme
      queryClient.setQueryData(cacheKey, data)
    },
  })
}

// Popular routes cache
export function usePopularRoutes() {
  return useQuery({
    queryKey: [QUERY_KEYS.POPULAR_AIRPORTS],
    queryFn: async () => {
      const response = await fetch('/api/flights/popular-routes')
      return response.json()
    },
    staleTime: 1000 * 60 * 30, // 30 dakika cache
    gcTime: 1000 * 60 * 60 * 2, // 2 saat garbage collection
  })
}

// Exchange rates cache (günde bir güncellenir)
export function useExchangeRates() {
  return useQuery({
    queryKey: [QUERY_KEYS.EXCHANGE_RATES],
    queryFn: async () => {
      const response = await fetch('/api/euro-rate')
      return response.json()
    },
    staleTime: 1000 * 60 * 60 * 12, // 12 saat cache
    gcTime: 1000 * 60 * 60 * 24, // 24 saat garbage collection
    refetchInterval: 1000 * 60 * 60 * 6, // 6 saatte bir otomatik güncelleme
  })
}
