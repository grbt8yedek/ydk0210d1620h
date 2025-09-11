'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, Clock, User, ArrowLeft, Share2, Bookmark } from 'lucide-react';

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  const blogPost = {
    id: 1,
    title: "Gurbetçiler İçin İndirimli Uçak Bileti: Bu Sizin Hakkınız!",
    content: `
      <p class="mb-6 text-lg text-gray-700 leading-relaxed">
        Gurbet hayatının en zor yanlarından biri, memlekete dönüş yolculuğunun masraflarıdır. Yüksek uçak bileti fiyatları, gurbetçilerin vatan özlemini daha da artırır. Ancak unutmayın ki indirimli uçak bileti bulmak, gurbetçilerin en doğal hakkıdır! Gurbetbiz olarak, Avrupa'dan Türkiye'ye en uygun fiyatlı uçak biletlerini sizler için sürekli güncelliyoruz.
      </p>

      <h2 class="text-2xl font-bold text-gray-800 mb-4 mt-8">Gurbetçilerin Uçak Bileti Hakları</h2>
      <p class="mb-4 text-gray-600">
        Avrupa'da yaşayan gurbetçiler, memlekete dönüş yolculuğunda uygun fiyatlı uçak bileti bulma hakkına sahiptir. Bu sadece bir ticari işlem değil, vatan özleminin bir parçasıdır. Gurbetbiz, gurbetçilerin bu haklarını savunuyor ve en uygun fiyatlı uçak biletlerini sunuyor.
      </p>
      <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
        <li>Erken rezervasyon fırsatları</li>
        <li>Gurbetçilere özel indirimler</li>
        <li>Esnek tarih seçenekleri</li>
        <li>Bagaj hakları</li>
      </ul>

      <h2 class="text-2xl font-bold text-gray-800 mb-4 mt-8">En Uygun Fiyatlı Uçak Biletleri Nasıl Bulunur?</h2>
      <p class="mb-4 text-gray-600">
        Gurbetbiz platformunda, gurbetçilerin ihtiyaçlarına özel uçak bileti arama özellikleri bulunuyor. Avrupa'dan Türkiye'ye giden tüm havayollarının fiyatlarını karşılaştırarak, en uygun seçeneği sunuyoruz.
      </p>
      <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
        <li>Fiyat alarmı özelliği</li>
        <li>Çoklu şehir arama</li>
        <li>Esnek tarih seçimi</li>
        <li>Direkt ve aktarmalı uçuş seçenekleri</li>
      </ul>

      <h2 class="text-2xl font-bold text-gray-800 mb-4 mt-8">Gurbetçiler İçin Özel Fırsatlar</h2>
      <p class="mb-4 text-gray-600">
        Gurbetbiz, gurbetçilere özel kampanyalar ve fırsatlar sunuyor. Bayram sezonlarında, yaz tatillerinde ve özel günlerde en uygun fiyatlı uçak biletlerini bulabilirsiniz.
      </p>
      <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
        <li>Bayram öncesi erken rezervasyon indirimleri</li>
        <li>Yaz sezonu özel fırsatları</li>
        <li>Gurbetçi sadakat programı</li>
        <li>Paket seyahat indirimleri</li>
      </ul>

      <h2 class="text-2xl font-bold text-gray-800 mb-4 mt-8">Otel Rezervasyonu ile Birlikte Tasarruf</h2>
      <p class="mb-4 text-gray-600">
        Gurbetbiz'de uçak bileti ile birlikte otel rezervasyonu yaparak ekstra tasarruf sağlayabilirsiniz. İstanbul, Antalya ve diğer şehirlerde gurbetçilerin tercih ettiği en iyi otelleri sunuyoruz.
      </p>
      <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
        <li>Uçak + Otel paket fırsatları</li>
        <li>Gurbetçilere özel otel indirimleri</li>
        <li>Merkezi konumda oteller</li>
        <li>Esnek iptal seçenekleri</li>
      </ul>

      <h2 class="text-2xl font-bold text-gray-800 mb-4 mt-8">Araç Kiralama Hizmetleri</h2>
      <p class="mb-4 text-gray-600">
        Memlekete döndüğünüzde ailenizi ziyaret etmek, eski dostlarınızla buluşmak için araç kiralama hizmeti çok önemlidir. Gurbetbiz, gurbetçilerin ihtiyaçlarına özel araç kiralama seçenekleri sunuyor.
      </p>
      <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
        <li>Havalimanından araç kiralama</li>
        <li>Günlük ve haftalık kiralama seçenekleri</li>
        <li>Sigorta dahil fiyatlar</li>
        <li>Otomatik ve manuel şanzıman seçenekleri</li>
      </ul>

      <h2 class="text-2xl font-bold text-gray-800 mb-4 mt-8">Gurbetçiler İçin Pratik İpuçları</h2>
      <p class="mb-4 text-gray-600">
        Uygun fiyatlı uçak bileti bulmak için dikkat edilmesi gereken noktalar:
      </p>
      <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
        <li>En az 3 ay önceden rezervasyon yapın</li>
        <li>Farklı tarihleri kontrol edin</li>
        <li>Gurbetbiz fiyat alarmını kullanın</li>
        <li>Paket seyahat seçeneklerini değerlendirin</li>
        <li>Sadakat programlarından yararlanın</li>
      </ul>

      <div class="bg-green-50 border-l-4 border-green-500 p-6 my-8">
        <h3 class="text-lg font-semibold text-green-800 mb-2">Gurbetbiz'den Özel İpucu</h3>
        <p class="text-green-700">
          Gurbetçiler için en uygun fiyatlı uçak biletlerini bulmak için Gurbetbiz'in gurbetçi özel arama motorunu kullanın. Bu özellik, sadece Avrupa'dan Türkiye'ye giden uçuşları gösterir ve en uygun fiyatları sıralar!
        </p>
      </div>

      <p class="text-gray-600 mt-8">
        Gurbetçilerin vatan yolculuğunda yanındayız! Uygun fiyatlı uçak bileti, otel rezervasyonu ve araç kiralama hizmetlerimizle memlekete dönüşünüzü kolaylaştırıyoruz. Çünkü gurbetçilerin bu hakları vardır!
      </p>
    `,
    author: "Gurbetbiz Ekibi",
    date: "4 Eylül 2025",
    readTime: "5 dk",
    category: "Gurbetçi Rehberi",
    image: "/images/blog/cheap-flights.jpg"
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
          <div className="container mx-auto px-4">
            <Link 
              href="/blog"
              className="inline-flex items-center text-green-100 hover:text-white mb-6 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Blog'a Dön
            </Link>
            <h1 className="text-4xl font-bold mb-4">{blogPost.title}</h1>
            <div className="flex items-center space-x-6 text-green-100">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                {blogPost.author}
              </div>
              <div className="flex items-center">
                <CalendarDays className="w-5 h-5 mr-2" />
                {blogPost.date}
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                {blogPost.readTime}
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <article className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Featured Image */}
              <div className="h-64 relative overflow-hidden">
                <Image
                  src={blogPost.image}
                  alt={blogPost.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              </div>

              <div className="p-8">
                {/* Category Badge */}
                <div className="mb-6">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {blogPost.category}
                  </span>
                </div>

                {/* Article Actions */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center text-gray-600 hover:text-green-600 transition-colors duration-200">
                      <Share2 className="w-5 h-5 mr-2" />
                      Paylaş
                    </button>
                    <button className="flex items-center text-gray-600 hover:text-green-600 transition-colors duration-200">
                      <Bookmark className="w-5 h-5 mr-2" />
                      Kaydet
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: blogPost.content }}
                />

                {/* Author Bio */}
                <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Yazar Hakkında</h3>
                  <p className="text-gray-600">
                    Gurbetbiz ekibi, Avrupa'da yaşayan gurbetçi Türklerin vatan yolculuğunda yanında olmak için çalışıyor. Uygun fiyatlı uçak biletleri, otel rezervasyonları ve araç kiralama hizmetleriyle gurbetçilerin memlekete dönüşünü kolaylaştırıyoruz. Çünkü gurbetçilerin bu hakları vardır!
                  </p>
                </div>
              </div>
            </article>

            {/* Related Articles */}
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Benzer Yazılar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/blog/2" className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Vatan Yolunda Dikkat Edilmesi Gerekenler</h3>
                  <p className="text-gray-600 text-sm">Gurbetçilerin Türkiye'ye dönüş yolculuğunda bilmesi gereken önemli detaylar ve pratik ipuçları.</p>
                </Link>
                <Link href="/blog/3" className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Türkiye'nin En Popüler Otelleri: Gurbetçiler İçin Özel Seçimler</h3>
                  <p className="text-gray-600 text-sm">İstanbul, Antalya ve diğer şehirlerimizde gurbetçilerin tercih ettiği en iyi oteller ve konaklama fırsatları.</p>
                </Link>
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
