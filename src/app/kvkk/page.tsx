'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function KVKKPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              KİŞİSEL VERİLERİN KORUNMASI KANUNU (KVKK) AYDINLATMA METNİ
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">1. Veri Sorumlusu</h2>
                <p className="text-gray-600 leading-relaxed">
                  Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Gurbetbiz ("Şirket") tarafından kişisel verilerinizin işlenmesine ilişkin bilgilendirme amacıyla hazırlanmıştır.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">2. Kişisel Verilerin İşlenme Amaçları</h2>
                <p className="text-gray-600 mb-4">Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Uçak bileti, otel rezervasyonu ve araç kiralama hizmetlerinin sunulması</li>
                  <li>Müşteri hesabının oluşturulması ve yönetimi</li>
                  <li>Rezervasyon işlemlerinin gerçekleştirilmesi</li>
                  <li>Ödeme işlemlerinin güvenli şekilde yapılması</li>
                  <li>Müşteri hizmetleri ve destek sağlanması</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  <li>Güvenlik önlemlerinin alınması</li>
                  <li>İstatistiksel analizler yapılması</li>
                  <li>Pazarlama faaliyetlerinin yürütülmesi (izin verdiğiniz takdirde)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">3. İşlenen Kişisel Veri Kategorileri</h2>
                <p className="text-gray-600 mb-4">İşlenen kişisel veri kategorileri şunlardır:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, doğum tarihi, TC kimlik numarası</li>
                  <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres</li>
                  <li><strong>Seyahat Bilgileri:</strong> Uçuş detayları, otel rezervasyonları, araç kiralama bilgileri</li>
                  <li><strong>Ödeme Bilgileri:</strong> Kredi kartı bilgileri (güvenli ödeme sistemleri aracılığıyla)</li>
                  <li><strong>İşlem Güvenliği:</strong> IP adresi, çerez bilgileri, oturum bilgileri</li>
                  <li><strong>Müşteri İşlemleri:</strong> Rezervasyon geçmişi, tercihler, şikayetler</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">4. Kişisel Verilerin Aktarılması</h2>
                <p className="text-gray-600 mb-4">Kişisel verileriniz aşağıdaki durumlarda aktarılabilir:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                  <li><strong>Hizmet Sağlayıcılar:</strong> Havayolu şirketleri, oteller, araç kiralama firmaları</li>
                  <li><strong>Ödeme Sistemleri:</strong> Güvenli ödeme işlemleri için bankalar ve ödeme sistemleri</li>
                  <li><strong>Yasal Zorunluluklar:</strong> Yasal yükümlülüklerin yerine getirilmesi için yetkili kurumlar</li>
                  <li><strong>Güvenlik:</strong> Güvenlik önlemlerinin alınması için gerekli kurumlar</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">5. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h2>
                <p className="text-gray-600 mb-4">Kişisel verileriniz aşağıdaki yöntemlerle toplanmaktadır:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Web sitesi ve mobil uygulama üzerinden</li>
                  <li>Müşteri hizmetleri kanalları aracılığıyla</li>
                  <li>Rezervasyon işlemleri sırasında</li>
                  <li>Çerezler ve benzer teknolojiler aracılığıyla</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  <strong>Hukuki Sebepler:</strong> Sözleşmenin kurulması ve ifası, yasal yükümlülüklerin yerine getirilmesi, meşru menfaatin korunması ve açık rızanız.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">6. KVKK Kapsamındaki Haklarınız</h2>
                <p className="text-gray-600 mb-4">KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                  <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                  <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                  <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                  <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                  <li>Kişisel verilerinizin aktarıldığı üçüncü kişilere yukarıda sayılan (e) ve (f) bentleri uyarınca yapılan işlemlerin bildirilmesini isteme</li>
                  <li>İşlenen verilerinizin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişiliğinize aleyhtar bir sonucun ortaya çıkmasına itiraz etme</li>
                  <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">7. Başvuru Hakkı</h2>
                <p className="text-gray-600 leading-relaxed">
                  Yukarıda belirtilen haklarınızı kullanmak için, kimlik doğrulaması yapılmak suretiyle yazılı olarak veya kayıtlı elektronik posta (KEP) adresi, güvenli elektronik imza, mobil imza ya da tarafımızca size bildirilen elektronik posta adresini kullanmak suretiyle başvurabilirsiniz.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">8. İletişim</h2>
                <p className="text-gray-600 leading-relaxed">
                  Kişisel verilerinizin işlenmesi ile ilgili sorularınız için bizimle iletişime geçebilirsiniz.{' '}
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

