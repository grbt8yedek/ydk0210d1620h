'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function TicariElektronikIletiPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              TİCARİ ELEKTRONİK İLETİ AÇIK RIZA METNİ
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">1. Giriş</h2>
                <p className="text-gray-600 leading-relaxed">
                  Bu açık rıza metni, 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun'un 4. maddesi ve 5. maddesi ile Ticari Elektronik İletiler Hakkında Yönetmelik uyarınca, Gurbetbiz ("Şirket") tarafından ticari elektronik ileti gönderilmesine ilişkin açık rızanızı almak amacıyla hazırlanmıştır.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">2. Ticari Elektronik İleti Nedir?</h2>
                <p className="text-gray-600 leading-relaxed">
                  Ticari elektronik ileti, ticari iletişim amacıyla gönderilen elektronik posta, kısa mesaj (SMS), çağrı merkezi araması ve benzeri iletişim araçları ile gönderilen mesajlardır. Bu iletişimler, ürün ve hizmetlerimiz hakkında bilgilendirme, kampanya ve fırsatlar, özel teklifler ve benzeri ticari amaçlı içerikler içerebilir.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">3. Gönderilecek Ticari Elektronik İletiler</h2>
                <p className="text-gray-600 mb-4">Gurbetbiz olarak aşağıdaki konularda ticari elektronik ileti gönderebiliriz:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Uçak bileti fırsatları ve kampanyaları</li>
                  <li>Otel rezervasyonu özel teklifleri</li>
                  <li>Araç kiralama indirimleri</li>
                  <li>Sezonsal kampanyalar ve promosyonlar</li>
                  <li>Yeni hizmet ve ürün duyuruları</li>
                  <li>Müşteri memnuniyeti anketleri</li>
                  <li>Özel gün ve bayram teklifleri</li>
                  <li>Sadakat programı bilgilendirmeleri</li>
                  <li>Güvenlik ve hizmet kalitesi güncellemeleri</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">4. İletişim Kanalları</h2>
                <p className="text-gray-600 mb-4">Ticari elektronik ileti gönderim kanalları:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li><strong>E-posta:</strong> info@gurbetbiz.com adresinden gönderilen e-postalar</li>
                  <li><strong>SMS:</strong> Mobil telefon numaranıza gönderilen kısa mesajlar</li>
                  <li><strong>Çağrı Merkezi:</strong> Müşteri hizmetleri aramaları</li>
                  <li><strong>Push Bildirim:</strong> Mobil uygulama üzerinden gönderilen bildirimler</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">5. Açık Rıza Verdiğiniz Konular</h2>
                <p className="text-gray-600 mb-4">Bu açık rıza metnini kabul etmekle:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li>Gurbetbiz'in size ticari elektronik ileti göndermesine açık rıza verdiğinizi kabul etmiş olursunuz.</li>
                  <li>Kişisel verilerinizin ticari elektronik ileti gönderimi amacıyla işlenmesine rıza verdiğinizi beyan edersiniz.</li>
                  <li>Gönderilen iletişimlerin ticari amaçlı olduğunu kabul edersiniz.</li>
                  <li>İletişim kanallarınızın (e-posta, telefon, SMS) ticari iletişim için kullanılmasına izin verirsiniz.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">6. Rızanızı Geri Çekme Hakkı</h2>
                <p className="text-gray-600 mb-4">Açık rızanızı istediğiniz zaman geri çekebilirsiniz:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li><strong>E-posta ile:</strong> info@gurbetbiz.com adresine "Rıza Geri Çekme" konulu e-posta göndererek</li>
                  <li><strong>Web sitesi üzerinden:</strong> Hesap ayarlarınızdan "İletişim Tercihleri" bölümünden</li>
                  <li><strong>Mobil uygulama:</strong> Uygulama ayarlarından bildirim tercihlerini kapatarak</li>
                  <li><strong>Çağrı merkezi:</strong> Müşteri hizmetleri ile iletişime geçerek</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  Rızanızı geri çekmeniz durumunda, 30 gün içerisinde ticari elektronik ileti gönderimi durdurulacaktır.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">7. Kişisel Verilerin Korunması</h2>
                <p className="text-gray-600 leading-relaxed">
                  Ticari elektronik ileti gönderimi amacıyla toplanan kişisel verileriniz, KVKK ve ilgili mevzuat kapsamında güvenli şekilde işlenmekte ve korunmaktadır. Detaylı bilgi için{' '}
                  <Link href="/gizlilik-politikasi" className="text-green-600 hover:text-green-700 underline">
                    Gizlilik Politikamızı
                  </Link>{' '}
                  inceleyebilirsiniz.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">8. İletişim</h2>
                <p className="text-gray-600 leading-relaxed">
                  Ticari elektronik ileti gönderimi ile ilgili sorularınız için bizimle iletişime geçebilirsiniz.{' '}
                  <Link href="/yardim" className="text-green-600 hover:text-green-700 underline">
                    Yardım ve İletişim
                  </Link>{' '}
                  sayfamızı ziyaret ediniz.
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

