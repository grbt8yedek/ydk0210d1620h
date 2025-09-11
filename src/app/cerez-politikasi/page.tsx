'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function CerezPolitikasiPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              GURBETBİZ ÇEREZ POLİTİKASI
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">1. Çerez Nedir?</h2>
                <p className="text-gray-600 leading-relaxed">
                  Çerezler, web siteleri tarafından cihazınıza (bilgisayar, telefon, tablet) gönderilen ve cihazınızda depolanan küçük metin dosyalarıdır. Çerezler, sitenin sizinle ilgili tercihlerinizi hatırlamasına ve deneyiminizi geliştirmesine yardımcı olur.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">2. Gurbetbiz'de Hangi Çerezler Kullanılır?</h2>
                <p className="text-gray-600 mb-4">Gurbetbiz olarak aşağıdaki çerez türlerini kullanıyoruz:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li><strong>Zorunlu Çerezler:</strong> Siteyi güvenli ve doğru şekilde kullanmanızı sağlar. Örneğin, oturum açma işlemleri için gereklidir.</li>
                  <li><strong>Performans Çerezleri:</strong> Sitemizin performansını ve kullanımını analiz eder, hangi sayfaların ziyaret edildiğini ölçeriz.</li>
                  <li><strong>Fonksiyonel Çerezler:</strong> Kullanıcı tercihlerinizi (dil seçimi gibi) hatırlayarak deneyiminizi kişiselleştirir.</li>
                  <li><strong>Reklam ve Analitik Çerezler:</strong> Site kullanımını anlamak ve size daha uygun reklamlar göstermek için kullanılır. (Varsa)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">3. Çerezlerin Kullanım Amaçları</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Sitenin düzgün çalışmasını sağlamak</li>
                  <li>Kullanıcı deneyimini geliştirmek</li>
                  <li>Ziyaretçi sayısını ve davranışlarını analiz etmek</li>
                  <li>Güvenlik önlemlerini artırmak</li>
                  <li>Pazarlama ve reklam hizmetlerini iyileştirmek</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">4. Çerezleri Yönetme ve Kapatma</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li>Çerezleri tarayıcı ayarlarınızdan engelleyebilir veya silebilirsiniz.</li>
                  <li>Ancak çerezleri engellemeniz durumunda, Gurbetbiz'in bazı özellikleri düzgün çalışmayabilir veya kullanımınız kısıtlanabilir.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">5. Üçüncü Taraf Çerezleri</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li>Gurbetbiz sitesi, üçüncü taraf hizmet sağlayıcıların (örneğin Google Analytics) çerezlerini kullanabilir.</li>
                  <li>Bu üçüncü tarafların çerez politikalarını ve kullanım koşullarını ayrıca incelemeniz önerilir.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">6. Çerez Politikası Değişiklikleri</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li>Bu politika zaman zaman güncellenebilir.</li>
                  <li>Güncellemeler sitemizde yayımlanır ve önemli değişikliklerde kullanıcılar bilgilendirilir.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">7. İletişim</h2>
                <p className="text-gray-600 leading-relaxed">
                  Çerez politikamız hakkında sorularınız olursa bizimle iletişime geçebilirsiniz.{' '}
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

