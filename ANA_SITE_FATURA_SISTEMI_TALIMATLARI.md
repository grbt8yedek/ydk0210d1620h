# 🔗 Ana Site Fatura Sistemi Kurulum Talimatları

**Admin panel ile entegre çalışacak fatura adresi sistemi kurulum rehberi**

---

## 1️⃣ Database Modeli (Prisma Schema)

Ana site Prisma schema'na bu modeli ekle:

```prisma
// Fatura Bilgileri
model BillingInfo {
  id              String   @id @default(cuid())
  userId          String
  type            String   // "individual" veya "corporate"
  title           String   // "Ev Adresi", "İş Adresi" vs.

  // Bireysel bilgiler
  firstName       String?
  lastName        String?

  // Kurumsal bilgiler
  companyName     String?
  taxOffice       String?  // Vergi Dairesi
  taxNumber       String?  // Vergi Numarası

  // Adres bilgileri
  address         String
  district        String?  // İlçe
  city            String
  country         String   @default("Türkiye")

  // Durum
  isDefault       Boolean  @default(false)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // İlişki
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

**User modeline de bu ilişkiyi ekle:**
```prisma
model User {
  // ... mevcut alanlar
  billingInfos  BillingInfo[]
}
```

---

## 2️⃣ API Endpoint'leri

`/app/api/billing-info/route.ts` dosyası oluştur:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Kendi prisma path'ini kullan

// GET - Kullanıcının fatura bilgilerini getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı ID gereklidir' },
        { status: 400 }
      )
    }

    const billingInfos = await prisma.billingInfo.findMany({
      where: { 
        userId: userId,
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
    const body = await request.json()
    const {
      userId,
      type,
      title,
      firstName,
      lastName,
      companyName,
      taxOffice,
      taxNumber,
      address,
      district,
      city,
      country = 'Türkiye',
      isDefault = false
    } = body

    // Gerekli alanları kontrol et
    if (!userId || !type || !title || !address || !city) {
      return NextResponse.json(
        { success: false, message: 'Gerekli alanlar eksik' },
        { status: 400 }
      )
    }

    // Eğer varsayılan olarak işaretleniyorsa, diğerlerini false yap
    if (isDefault) {
      await prisma.billingInfo.updateMany({
        where: { userId },
        data: { isDefault: false }
      })
    }

    const billingInfo = await prisma.billingInfo.create({
      data: {
        userId,
        type,
        title,
        firstName,
        lastName,
        companyName,
        taxOffice,
        taxNumber,
        address,
        district,
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
```

---

## 3️⃣ Frontend Fatura Sayfası

`/app/hesabim/fatura/page.tsx` sayfasını oluştur veya güncelle:

### Özellikler:
- ✅ **İki tip fatura:** Bireysel ve Kurumsal
- ✅ **Bireysel:** Ad, Soyad, Adres, İlçe, Şehir
- ✅ **Kurumsal:** Şirket Adı, Vergi Dairesi, Vergi No, Adres, İlçe, Şehir
- ✅ **Adres başlığı:** "Ev Adresi", "İş Adresi" gibi
- ✅ **Varsayılan adres** seçimi
- ✅ **Çoklu adres** desteği
- ❌ **TC Kimlik No isteme** (kaldırıldı)
- ❌ **Posta Kodu isteme** (kaldırıldı)

### Form Alanları:

**Bireysel Fatura:**
```
- Adres Başlığı (örn: "Ev Adresi")
- Ad
- Soyad
- Tam Adres
- İlçe
- Şehir/İl
- Varsayılan Adres (checkbox)
```

**Kurumsal Fatura:**
```
- Adres Başlığı (örn: "Şirket Adresi")
- Şirket Adı
- Vergi Dairesi
- Vergi Numarası
- Tam Adres
- İlçe
- Şehir/İl
- Varsayılan Adres (checkbox)
```

---

## 4️⃣ Database Bağlantısı

**ÖNEMLİ:** Aynı Neon database'i kullan:
```env
DATABASE_URL="postgresql://neondb_owner:XXXX@ep-icy-mode-ag8baxgo-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

**Not:** Admin panel ile aynı database'i paylaş ki veriler senkronize olsun.

---

## 5️⃣ Admin Panel Entegrasyonu

Bu işlemlerden sonra otomatik olarak:
- ✅ Admin panelde kullanıcı detayında adresler gözükecek
- ✅ Ana sitede eklenen adresler admin panelde görünecek
- ✅ İki site aynı database'i paylaşacak
- ✅ Gerçek zamanlı senkronizasyon olacak

**Admin Panel URL:** https://grbt8ap-kdhnjeexj-grbt8.vercel.app

---

## 6️⃣ Test Senaryosu

### Adım Adım Test:
1. **Ana sitede** kullanıcı hesap açsın
2. **Fatura sayfasında** (`/hesabim/fatura`) adres eklesin
3. **Admin panelde** o kullanıcının detayına git
4. **"Fatura Adresleri"** bölümünde adresin gözüktüğünü kontrol et
5. **İki yönlü senkronizasyonu** test et

### Beklenen Sonuç:
- Ana sitede eklenen adres admin panelde görünmeli
- Admin panelden görüntülenen adresler doğru formatta olmalı
- Bireysel ve kurumsal adresler farklı ikonlarla gösterilmeli

---

## 🚀 Sonuç

Bu talimatları uygladıktan sonra:
- Ana site ve admin panel mükemmel entegre çalışacak
- Kullanıcılar fatura adreslerini ana siteden ekleyebilecek
- Admin panel üzerinden tüm adresler görüntülenebilecek
- İki sistem aynı database'i paylaştığı için anlık senkronizasyon olacak

**Başarılar! 🎯**

---

*Dosya Oluşturulma Tarihi: 18 Eylül 2024*
*Admin Panel: https://grbt8ap-kdhnjeexj-grbt8.vercel.app*
