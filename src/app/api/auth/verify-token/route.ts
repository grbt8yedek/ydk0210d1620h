import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let token = searchParams.get('token')

    console.log('Debug - Raw token from URL:', token)
    
    // URL decode işlemi
    if (token) {
      try {
        token = decodeURIComponent(token)
        console.log('Debug - Decoded token:', token)
      } catch (e) {
        console.log('Debug - Token decode error:', e)
      }
    }

    console.log('Debug - Final token:', token)
    console.log('Debug - Token length:', token?.length)
    console.log('Debug - Token type:', typeof token)

    if (!token) {
      console.log('Debug - No token provided')
      return NextResponse.json({ valid: false, error: 'No token provided' })
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    })

    console.log('Debug - User found:', !!user)
    if (user) {
      console.log('Debug - User ID:', user.id)
      console.log('Debug - Reset token expiry:', user.resetTokenExpiry)
      console.log('Debug - Current time:', new Date())
    } else {
      // Tüm resetToken'ları kontrol et
      const allUsersWithTokens = await prisma.user.findMany({
        where: {
          resetToken: {
            not: null
          }
        },
        select: {
          id: true,
          email: true,
          resetToken: true,
          resetTokenExpiry: true
        }
      })
      console.log('Debug - All users with reset tokens:', allUsersWithTokens)
    }

    return NextResponse.json({ valid: !!user })

  } catch (error: any) {
    console.error('Token verification error:', error)
    return NextResponse.json({ valid: false, error: error.message || 'Unknown error' })
  }
}
