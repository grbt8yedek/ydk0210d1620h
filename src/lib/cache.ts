// In-memory cache (Redis alternatifi - development için)
// Production'da Redis kullanılabilir

interface CacheItem<T> {
  data: T
  expiry: number
  createdAt: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()
  private maxSize = 1000 // Maximum cache items

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    // Cache size limit check
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    const expiry = Date.now() + (ttlSeconds * 1000)
    this.cache.set(key, {
      data,
      expiry,
      createdAt: Date.now()
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Expiry check
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Expired items cleanup
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((item, key) => {
      if (now > item.expiry) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.cache.delete(key))

    // If still too many items, remove oldest
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].createdAt - b[1].createdAt)
      
      const toRemove = Math.floor(this.maxSize * 0.1) // Remove 10%
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0])
      }
    }
  }

  // Cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    }
  }
}

export const cache = new MemoryCache()

// Cache utility functions
export const cacheKeys = {
  flightSearch: (params: any) => `flight-search:${JSON.stringify(params)}`,
  airportData: (code: string) => `airport:${code}`,
  exchangeRate: () => 'exchange-rate:eur-try',
  userProfile: (userId: string) => `user:${userId}`,
  agencyBalance: () => 'agency-balance',
  campaigns: () => 'campaigns:active',
}

// Cache wrapper for API responses
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try cache first
  const cached = cache.get<T>(key)
  if (cached) {
    return cached
  }

  // Fetch and cache
  try {
    const data = await fetcher()
    cache.set(key, data, ttlSeconds)
    return data
  } catch (error) {
    // On error, try to return stale cache if available
    const stale = cache.get<T>(key)
    if (stale) {
      return stale
    }
    throw error
  }
}
