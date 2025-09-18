import { NextRequest, NextResponse } from 'next/server'

// Cache sistemi - 5 dakika boyunca sakla
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 dakika

export async function GET(request: NextRequest) {
  try {
    // Cache kontrolü
    const cacheKey = 'campaigns'
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Cache\'den kampanyalar döndürülüyor')
      return NextResponse.json(cached.data, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Cache-Control': 'public, max-age=300', // 5 dakika browser cache
        },
      })
    }

    // Admin panel API'sine proxy request
    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://www.grbt8.store'
    
    // Timeout ile API çağrısı
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 saniye timeout
    
    try {
      const response = await fetch(`${adminApiUrl}/api/campaigns`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Admin API error: ${response.status}`)
      }

      const data = await response.json()
      
      // Cache'e kaydet
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })
      
      return NextResponse.json(data, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Cache-Control': 'public, max-age=300', // 5 dakika browser cache
        },
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }

  } catch (error) {
    console.warn('Admin API çalışmıyor, demo veri kullanılıyor:', error)
    
    // Demo veri
    const demoData = {
      success: true,
      data: [
        {
          id: 'demo-1',
          title: 'Erken Rezervasyon',
          description: 'Erken rezervasyonla %30 indirim',
          imageUrl: '/images/campaigns/early-flight.jpg',
          altText: 'Erken Rezervasyon Kampanyası',
          linkUrl: '/flights/search',
          status: 'active',
          position: 1,
          clickCount: 0,
          viewCount: 0,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'demo-2',
          title: 'Otel Fırsatları',
          description: 'Avrupa otellerinde %25 indirim',
          imageUrl: '/images/campaigns/hotel-deals.jpg',
          altText: 'Otel Fırsatları Kampanyası',
          linkUrl: '/flights/search',
          status: 'active',
          position: 2,
          clickCount: 0,
          viewCount: 0,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'demo-3',
          title: 'Araç Kiralama',
          description: 'Araç kiralama fırsatları',
          imageUrl: '/images/campaigns/car-rental.jpg',
          altText: 'Araç Kiralama Kampanyası',
          linkUrl: '/flights/search',
          status: 'active',
          position: 3,
          clickCount: 0,
          viewCount: 0,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]
    }

    // Demo veriyi de cache'e kaydet (kısa süre)
    cache.set('campaigns', {
      data: demoData,
      timestamp: Date.now()
    })
    
    return NextResponse.json(demoData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=60', // Demo veri için 1 dakika cache
      },
    })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

