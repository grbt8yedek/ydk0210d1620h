import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    
    // Admin panel API'sine proxy request
    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://www.grbt8.store'
    const response = await fetch(`${adminApiUrl}/api/campaigns/${campaignId}/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

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
  } catch (error) {
    console.error('Campaign click API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update click count' },
      { status: 500 }
    )
  }
}



