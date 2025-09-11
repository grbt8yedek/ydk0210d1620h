import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Admin panel API'sine proxy request
    const response = await fetch('http://localhost:3004/api/campaigns', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // Admin API çalışmıyorsa demo veri döndür
      console.warn(`Admin API error: ${response.status} - Demo data kullanılıyor`)
      return NextResponse.json({
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
          }
        ]
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Campaigns API error:', error)
    // Hata durumunda da demo veri döndür
    return NextResponse.json({
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
        }
      ]
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

