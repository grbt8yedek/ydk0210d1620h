# 🚀 GurbetBiz Admin Panel Geliştirme Rehberi

## 📋 Sistem Genel Bakış

### 🏗️ Mevcut Sistem (grbt8)
```
📍 URL: http://localhost:3001
🛠️ Teknoloji: Next.js 13.5.6 + TypeScript + Tailwind CSS
💾 Veritabanı: SQLite (Prisma)
🔐 Auth: NextAuth.js + bcrypt
📱 Responsive: Mobile-first design
```

## 📁 Proje Yapısı

### 🏠 Ana Sayfalar
```
🏠 Ana Sayfa: /
✈️ Uçuş Arama: /flights/search
🎫 Uçuş Rezervasyon: /flights/booking
💳 Ödeme: /payment
👤 Hesabım: /hesabim/
├── ✈️ Seyahatlerim: /hesabim/seyahatlerim
├── 👤 Yolcularım: /hesabim/yolcularim
├── 🎫 Favoriler: /hesabim/favoriler
├── 🔔 Alarmlar: /hesabim/alarmlar
├── 💰 Puanlarım: /hesabim/puanlarim
└── 📄 Fatura: /hesabim/fatura
```

### 🔌 API Endpoints
```
🔐 Auth: /api/auth/login, /api/auth/register
👤 Kullanıcılar: /api/user/update
✈️ Uçuşlar: /api/flights/search (demo)
👤 Yolcular: /api/passengers/
💳 Ödeme: /api/payment/bin-info
📊 Raporlar: /api/reports/sales
```

## 💾 Veritabanı Şeması

### 📊 Tablolar
```sql
-- Kullanıcılar
User {
  id: String (Primary Key)
  email: String (Unique)
  firstName: String
  lastName: String
  password: String (Hashed)
  phone: String?
  createdAt: DateTime
  updatedAt: DateTime
}

-- Yolcular
Passenger {
  id: String (Primary Key)
  userId: String (Foreign Key -> User.id)
  firstName: String
  lastName: String
  birthDate: DateTime
  documentType: String
  documentNumber: String
  nationality: String
  createdAt: DateTime
  updatedAt: DateTime
}

-- Fiyat Alarmları
PriceAlert {
  id: String (Primary Key)
  userId: String (Foreign Key -> User.id)
  origin: String
  destination: String
  targetPrice: Float?
  lastNotifiedPrice: Float?
  createdAt: DateTime
  updatedAt: DateTime
}

-- Favori Aramalar
SearchFavorite {
  id: String (Primary Key)
  userId: String (Foreign Key -> User.id)
  origin: String
  destination: String
  departureDate: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 🎨 UI/UX Özellikleri

### 📱 Responsive Design
```
📱 Mobile-first approach
🖥️ Desktop optimized
🌙 Dark/Light mode ready
🎨 Tailwind CSS styling
📊 Demo API integration
🔍 Search filters
📅 Date pickers
💳 Payment integration
```

### 🧩 Modüler Yapı
```
📦 src/components/
├── 🎫 booking/ (7 dosya)
│   ├── BaggageSelection.tsx
│   ├── ContactForm.tsx
│   ├── FlightDetailsCard.tsx
│   ├── PassengerForm.tsx
│   ├── PassengerList.tsx
│   ├── PriceSummary.tsx
│   └── ReservationModal.tsx
├── 👤 passenger/ (4 dosya)
│   ├── DateSelector.tsx
│   ├── DocumentSection.tsx
│   ├── PassengerForm.tsx
│   └── PersonalInfoSection.tsx
└── ✈️ travel/ (5 dosya)
    ├── CarCard.tsx
    ├── EmptyState.tsx
    ├── FlightCard.tsx
    ├── HotelCard.tsx
    └── TabSelector.tsx
```

## 🔧 Teknik Özellikler

### ✅ Mevcut Özellikler
```
✅ TypeScript tip güvenliği
✅ Prisma ORM entegrasyonu
✅ NextAuth.js authentication
✅ Demo API entegrasyonu
✅ Mobile-optimized design
✅ SEO-friendly structure
✅ Modular component architecture
✅ Error handling
✅ Loading states
✅ Form validation
```

### 🎯 Demo API'ler
```
✈️ Turkish Airlines: 120 EUR
✈️ SunExpress: 99 EUR
🎒 Baggage options
📅 Date selection
👥 Passenger management
```

## 🔐 Authentication

### 👤 Test Kullanıcıları
```
📧 Email: test@gurbet.biz
🔑 Şifre: test123
📧 Email: tommy@gurbet.biz
🔑 Şifre: 123456
📧 Email: momo@gurbet.biz
🔑 Şifre: 123456
```

### 🔐 Auth Flow
```
1. Login: /api/auth/login
2. Register: /api/auth/register
3. Session: NextAuth.js
4. Password: bcrypt hashed
5. Database: Prisma User table
```

## 🚀 Admin Panel Geliştirme Planı

### 📋 Gerekli Özellikler

#### 📊 Dashboard
```
📈 Satış raporları
👥 Kullanıcı istatistikleri
✈️ Uçuş performansı
💰 Gelir analizi
📊 Grafik ve chartlar
```

#### 👥 Kullanıcı Yönetimi
```
👤 Kullanıcı listesi
➕ Yeni kullanıcı ekleme
✏️ Kullanıcı düzenleme
🗑️ Kullanıcı silme
🔍 Kullanıcı arama
📊 Kullanıcı analitikleri
```

#### ✈️ Uçuş Yönetimi
```
🛫 Uçuş rotaları
💰 Fiyat yönetimi
📅 Tarih yönetimi
🎫 Rezervasyon yönetimi
📊 Uçuş istatistikleri
```

#### 💰 Ödeme Yönetimi
```
💳 Ödeme işlemleri
📊 Gelir raporları
🔍 İşlem arama
📈 Ödeme analitikleri
```

### 🛠️ Teknoloji Stack

#### 🎨 UI Framework
```
📦 Next.js 14
🎨 Tailwind CSS
🔄 Shadcn/ui components
📊 Recharts (grafikler)
🎯 Lucide React (ikonlar)
```

#### 🔧 Backend
```
💾 Prisma ORM
🔐 NextAuth.js
📡 API Routes
🛡️ Middleware
```

#### 📊 Veritabanı
```
💾 SQLite (development)
🐘 PostgreSQL (production)
📊 Prisma Studio
```

## 🔗 Bağlantı Bilgileri

### 🌐 URL'ler
```
🌐 Ana Site: http://localhost:3001
🔧 Admin Panel: http://localhost:3002 (planlanan)
💾 Prisma Studio: http://localhost:5555
```

### 📁 Dosya Yapısı
```
📁 grbt8/
├── 📁 src/
│   ├── 📁 app/
│   ├── 📁 components/
│   ├── 📁 services/
│   └── 📁 types/
├── 📁 prisma/
│   ├── schema.prisma
│   └── dev.db
├── 📁 public/
└── 📄 .env
```

### 🔧 Environment Variables
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3001"
```

## 🚀 Kurulum Talimatları

### 1. Admin Panel Oluşturma
```bash
# Yeni proje oluştur
npx create-next-app@latest gurbet-admin --typescript --tailwind --app
cd gurbet-admin

# Port ayarı
# package.json'da "dev": "next dev -p 3002"
```

### 2. Veritabanı Bağlantısı
```bash
# .env dosyasını kopyala
cp ../grbt8/.env .

# Prisma schema kopyala
cp ../grbt8/prisma ./prisma

# Prisma client generate et
npx prisma generate
```

### 3. UI Kütüphaneleri
```bash
# Shadcn/ui kurulumu
npm install @shadcn/ui lucide-react recharts
npx shadcn-ui@latest init

# Ek kütüphaneler
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-tabs
```

### 4. API Bağlantısı
```javascript
// Ana site API'lerini çağırma
const response = await fetch('http://localhost:3001/api/users');
const data = await response.json();
```

## 📊 Sistem Durumu

### ✅ Çalışan Özellikler
```
✅ Ana site çalışıyor (localhost:3001)
✅ Login sistemi çalışıyor
✅ Veritabanı bağlantısı aktif
✅ Demo API'ler çalışıyor
✅ Modüler yapı hazır
✅ Mobile responsive
✅ TypeScript tip güvenliği
```

### ⚠️ Bilinen Sorunlar
```
⚠️ Webpack cache uyarıları (kritik değil)
⚠️ Prisma Studio port çakışması
⚠️ Node.js versiyonu uyumsuzluğu
```

## 🎯 Sonraki Adımlar

### 1. Admin Panel Geliştirme
```
📊 Dashboard sayfası
👥 Kullanıcı yönetimi
✈️ Uçuş yönetimi
💰 Ödeme yönetimi
📊 Raporlar
```

### 2. Güvenlik
```
🔐 Admin authentication
🛡️ Role-based access
🔒 IP kısıtlaması
📝 Audit logs
```

### 3. Deployment
```
🌐 Production deployment
🔧 Environment setup
📊 Monitoring
🔒 SSL sertifikası
```

## 📞 İletişim

### 🔗 Repository
```
📦 Ana Proje: grbt8
📦 Yedek: yedek48
📦 Admin Panel: gurbet-admin (planlanan)
```

### 📋 Notlar
- Sistem tamamen çalışır durumda
- Veritabanı bağlantısı hazır
- API'ler demo modunda
- Modüler yapı mevcut
- Mobile-responsive tasarım

---

**Son Güncelleme:** 18 Temmuz 2025  
**Versiyon:** 1.0.0  
**Durum:** Production Ready ✅ 