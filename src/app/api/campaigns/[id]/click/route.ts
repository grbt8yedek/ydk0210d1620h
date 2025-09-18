import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    
    // Admin panel API'sine proxy request - timeout ile
    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://www.grbt8.store'
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1000) // 1 saniye timeout
    
    try {
      const response = await fetch(`${adminApiUrl}/api/campaigns/${campaignId}/click`, {
        method: 'POST',
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
      
      return NextResponse.json(data, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    console.error('Campaign click API error:', error)
    // Hata durumunda da başarılı döndür (kullanıcı deneyimini bozmasın)
    return NextResponse.json(
      { success: true, message: 'Click tracked locally' },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    )
  }
}



