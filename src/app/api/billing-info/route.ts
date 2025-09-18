import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Kullanıcının fatura bilgilerini getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Session:', session); // Debug için
    
    if (!session?.user?.id) {
      console.log('No session or user ID'); // Debug için
      return NextResponse.json(
        { success: false, message: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    const billingInfos = await prisma.billingInfo.findMany({
      where: { 
        userId: session.user.id,
        isActive: true 
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: billingInfos
    })

  } catch (error) {
    console.error('Fatura bilgileri getirme hatası:', error)
    return NextResponse.json(
      { success: false, message: 'Fatura bilgileri getirilemedi' },
      { status: 500 }
    )
  }
}

// POST - Yeni fatura bilgisi ekle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('POST Session:', session); // Debug için
    
    if (!session?.user?.id) {
      console.log('POST No session or user ID'); // Debug için
      return NextResponse.json(
        { success: false, message: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      type,
      title,
      firstName,
      lastName,
      companyName,
    taxNumber,
      address,
      city,
      country,
      isDefault = false
    } = body

    // Gerekli alanları kontrol et
    if (!type || !title || !address || !city) {
      return NextResponse.json(
        { success: false, message: 'Gerekli alanlar eksik' },
        { status: 400 }
      )
    }

    // Bireysel için ad soyad kontrolü
    if (type === 'individual' && (!firstName || !lastName)) {
      return NextResponse.json(
        { success: false, message: 'Ad ve soyad gereklidir' },
        { status: 400 }
      )
    }

    // Kurumsal için şirket bilgileri kontrolü
    if (type === 'corporate' && (!companyName || !taxNumber)) {
      return NextResponse.json(
        { success: false, message: 'Şirket adı ve vergi numarası gereklidir' },
        { status: 400 }
      )
    }

    // Eğer varsayılan olarak işaretleniyorsa, diğerlerini false yap
    if (isDefault) {
      await prisma.billingInfo.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      })
    }

    const billingInfo = await prisma.billingInfo.create({
      data: {
        userId: session.user.id,
        type,
        title,
        firstName,
        lastName,
        companyName,
    taxNumber,
        address,
        city,
        country,
        isDefault
      }
    })

    return NextResponse.json({
      success: true,
      data: billingInfo
    })

  } catch (error) {
    console.error('Fatura bilgisi ekleme hatası:', error)
    return NextResponse.json(
      { success: false, message: 'Fatura bilgisi eklenemedi' },
      { status: 500 }
    )
  }
}

// PUT - Fatura bilgisi güncelle
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      id,
      type,
      title,
      firstName,
      lastName,
      companyName,
    taxNumber,
      address,
      city,
      country,
      isDefault = false
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Fatura bilgisi ID gereklidir' },
        { status: 400 }
      )
    }

    // Gerekli alanları kontrol et
    if (!type || !title || !address || !city) {
      return NextResponse.json(
        { success: false, message: 'Gerekli alanlar eksik' },
        { status: 400 }
      )
    }

    // Bireysel için ad soyad kontrolü
    if (type === 'individual' && (!firstName || !lastName)) {
      return NextResponse.json(
        { success: false, message: 'Ad ve soyad gereklidir' },
        { status: 400 }
      )
    }

    // Kurumsal için şirket bilgileri kontrolü
    if (type === 'corporate' && (!companyName || !taxNumber)) {
      return NextResponse.json(
        { success: false, message: 'Şirket adı ve vergi numarası gereklidir' },
        { status: 400 }
      )
    }

    // Eğer varsayılan olarak işaretleniyorsa, diğerlerini false yap
    if (isDefault) {
      await prisma.billingInfo.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      })
    }

    const billingInfo = await prisma.billingInfo.update({
      where: { 
        id: id,
        userId: session.user.id // Güvenlik için kullanıcı kontrolü
      },
      data: {
        type,
        title,
        firstName,
        lastName,
        companyName,
    taxNumber,
        address,
        city,
        country,
        isDefault
      }
    })

    return NextResponse.json({
      success: true,
      data: billingInfo
    })

  } catch (error) {
    console.error('Fatura bilgisi güncelleme hatası:', error)
    return NextResponse.json(
      { success: false, message: 'Fatura bilgisi güncellenemedi' },
      { status: 500 }
    )
  }
}

// DELETE - Fatura bilgisi sil
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Fatura bilgisi ID gereklidir' },
        { status: 400 }
      )
    }

    // Soft delete - isActive'i false yap
    const billingInfo = await prisma.billingInfo.update({
      where: { 
        id: id,
        userId: session.user.id // Güvenlik için kullanıcı kontrolü
      },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Fatura bilgisi silindi'
    })

  } catch (error) {
    console.error('Fatura bilgisi silme hatası:', error)
    return NextResponse.json(
      { success: false, message: 'Fatura bilgisi silinemedi' },
      { status: 500 }
    )
  }
}
