import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache süresi: 5 dakika
      staleTime: 1000 * 60 * 5,
      // Garbage collection: 10 dakika
      gcTime: 1000 * 60 * 10,
      // Retry stratejisi
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false
        return failureCount < 3
      },
      // Background refetch
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      // Mutation retry
      retry: 1,
    },
  },
})

// Cache keys için constants
export const QUERY_KEYS = {
  // Flights
  FLIGHT_SEARCH: 'flight-search',
  FLIGHT_DETAILS: 'flight-details',
  
  // Airports
  AIRPORTS: 'airports',
  POPULAR_AIRPORTS: 'popular-airports',
  
  // User
  USER_PROFILE: 'user-profile',
  USER_RESERVATIONS: 'user-reservations',
  USER_PASSENGERS: 'user-passengers',
  
  // System
  EXCHANGE_RATES: 'exchange-rates',
  CAMPAIGNS: 'campaigns',
  
  // BiletDukkani API
  BD_PROVIDERS: 'bd-providers',
  BD_AGENCY_BALANCE: 'bd-agency-balance',
} as const
