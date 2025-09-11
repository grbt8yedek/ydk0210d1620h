'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function KullanimSartlariPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              GURBETBİZ KULLANIM KOŞULLARI
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">1. Giriş</h2>
                <p className="text-gray-600 leading-relaxed">
                  Bu Kullanım Koşulları ("Koşullar"), Gurbetbiz ("Şirket") tarafından sunulan uçak bileti, otel rezervasyonu ve araç kiralama hizmetlerinin kullanımına ilişkin şartları belirler. Web sitemizi veya mobil uygulamamızı kullanarak, bu Koşulları kabul etmiş sayılırsınız.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">2. Hizmet Tanımı</h2>
                <p className="text-gray-600 mb-4">Gurbetbiz, kullanıcılarına aşağıdaki hizmetleri sunar:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li><strong>Uçak Bileti Rezervasyonu:</strong> Çeşitli havayolu şirketlerinden uçak bileti satın alma imkanı.</li>
                  <li><strong>Otel Rezervasyonu:</strong> Yurt içi ve yurt dışındaki otellerde konaklama rezervasyonu yapma imkanı.</li>
                  <li><strong>Araç Kiralama:</strong> Farklı lokasyonlarda araç kiralama hizmeti.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">3. Kullanıcı Yükümlülükleri</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li><strong>Doğru Bilgi:</strong> Kullanıcılar, kayıt ve rezervasyon işlemlerinde doğru ve güncel bilgi vermekle yükümlüdür.</li>
                  <li><strong>Hesap Güvenliği:</strong> Hesap bilgilerinin gizliliği kullanıcıya aittir. Yetkisiz kullanım durumunda derhal Şirket'e bildirilmelidir.</li>
                  <li><strong>Yaş Sınırı:</strong> Hizmetlerimizden yararlanmak için en az 18 yaşında olmanız gerekmektedir.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">4. Rezervasyon ve Ödeme</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li><strong>Rezervasyon:</strong> Tüm rezervasyonlar, sistemimiz üzerinden yapılmalı ve onaylanmalıdır.</li>
                  <li><strong>Ödeme:</strong> Ödemeler, kredi kartı veya diğer belirtilen ödeme yöntemleriyle gerçekleştirilmelidir.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">5. İptal ve Değişiklik</h2>
                <p className="text-gray-600 leading-relaxed">
                  Rezervasyon iptal ve değişiklik işlemleri, havayolu şirketlerinin ve otellerin kendi politikalarına tabidir. İptal ve değişiklik ücretleri, ilgili hizmet sağlayıcının koşullarına göre belirlenir.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">6. Sorumluluk Sınırları</h2>
                <p className="text-gray-600 leading-relaxed">
                  Şirket, hizmet sağlayıcıların eylem veya ihmallerinden kaynaklanan zararlardan sorumlu değildir. Kullanıcılar, seyahat sırasında oluşabilecek riskleri kabul eder.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">7. Fikri Mülkiyet Hakları</h2>
                <p className="text-gray-600 leading-relaxed">
                  Web sitemizde yer alan tüm içerik (metin, görsel, logo vb.) Şirket'e aittir. İzinsiz kullanım yasaktır.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">8. Sorumluluk Reddi</h2>
                <p className="text-gray-600 leading-relaxed">
                  Şirket, hizmet sağlayıcıların eylem veya ihmallerinden kaynaklanan zararlardan sorumlu değildir.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">9. Gizlilik Politikası</h2>
                <p className="text-gray-600 leading-relaxed">
                  Kullanıcı bilgilerinin gizliliği önemlidir. Detaylı bilgi için{' '}
                  <Link href="/gizlilik-politikasi" className="text-green-600 hover:text-green-700 underline">
                    Gizlilik Politikası
                  </Link>{' '}
                  sayfamızı ziyaret ediniz.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">10. Değişiklikler</h2>
                <p className="text-gray-600 leading-relaxed">
                  Şirket, bu Koşulları önceden bildirimde bulunmaksızın değiştirme hakkını saklı tutar.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">11. Uygulanacak Hukuk ve Yetki</h2>
                <p className="text-gray-600 leading-relaxed">
                  Bu Koşullar, Türkiye Cumhuriyeti yasalarına tabidir. Taraflar, İstanbul Mahkemeleri ve İcra Daireleri'nin yetkisini kabul eder.
                </p>
              </section>

              <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 text-center">
                  Son güncelleme: 4 Eylül 2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

