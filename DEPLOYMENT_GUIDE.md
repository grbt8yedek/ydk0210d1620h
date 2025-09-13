# Vercel Deployment Rehberi

## 1. Neon Veritabanı Bağlantısı
- Neon dashboard'dan PostgreSQL connection string'i alın
- Format: `postgresql://username:password@hostname:port/database?sslmode=require`

## 2. Environment Variables (Vercel Dashboard'da ayarlayın)
```
DATABASE_URL=postgresql://gerçek-neon-url
NEXTAUTH_SECRET=random-secret-key-32-chars-min
NEXTAUTH_URL=https://your-domain.vercel.app
BILET_DUKKANI_API_URL=https://api.biletdukkani.com
BILET_DUKKANI_API_KEY=your-api-key
```

## 3. Vercel Deployment Komutları
```bash
# Vercel CLI ile deploy
npx vercel

# Veya GitHub ile otomatik deploy
# 1. GitHub'a push yapın
# 2. Vercel dashboard'da GitHub repo'yu bağlayın
# 3. Environment variables'ları ayarlayın
# 4. Deploy edin
```

## 4. Build Ayarları (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

## 5. Migration (Production'da)
```bash
# Vercel'de migration çalıştırmak için
npx vercel env pull .env.local
npx prisma migrate deploy
```

## 6. Kontrol Edilecekler
- ✅ Build başarılı
- ✅ Prisma Client generate edildi
- ✅ Environment variables hazır
- ⚠️ DATABASE_URL gerçek Neon URL ile değiştirilmeli
- ⚠️ API keys gerçek değerlerle değiştirilmeli
