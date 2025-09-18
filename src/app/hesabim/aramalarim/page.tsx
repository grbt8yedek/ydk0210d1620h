'use client';

import AccountSidebar from '@/components/AccountSidebar';
import Footer from '@/components/Footer';
import { useSession, signOut } from 'next-auth/react';
import { User, Plane, Users, Star, Receipt, Search, Bell, Heart, ArrowRight, Calendar } from 'lucide-react';

export default function AramalarimPage() {
  const searches = [
    {
      id: 1,
      from: 'İstanbul',
      to: 'Ankara',
      date: '15 Mart 2024',
      passengers: '2 Yetişkin',
      searchDate: '10 Mart 2024'
    },
    {
      id: 2,
      from: 'İzmir',
      to: 'Antalya',
      date: '20 Mart 2024',
      passengers: '1 Yetişkin, 1 Çocuk',
      searchDate: '9 Mart 2024'
    },
    {
      id: 3,
      from: 'Ankara',
      to: 'İstanbul',
      date: '25 Mart 2024',
      passengers: '1 Yetişkin',
      searchDate: '8 Mart 2024'
    }
  ];

  const menuItems = [
    { icon: User, label: 'Hesabım', href: '/hesabim' },
    { icon: Plane, label: 'Seyahatlerim', href: '/hesabim/seyahatlerim' },
    { icon: Users, label: 'Yolcularım', href: '/hesabim/yolcularim' },
    { icon: Star, label: 'Puanlarım', href: '/hesabim/puanlarim' },
    { icon: Receipt, label: 'Fatura Bilgilerim', href: '/hesabim/fatura' },
    { icon: Search, label: 'Aramalarım', href: '/hesabim/aramalarim' },
    { icon: Bell, label: 'Fiyat Alarmlarım', href: '/hesabim/alarmlar' },
    { icon: Heart, label: 'Favorilerim', href: '/hesabim/favoriler' },
  ];
  const handleLogout = () => { signOut({ callbackUrl: '/' }); };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-6 h-6 text-gray-400" />
              <h1 className="text-2xl font-bold text-gray-800">Son Aramalarım</h1>
            </div>
            
            <div className="space-y-4">
              {searches.map((search) => (
                <div 
                  key={search.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500">Nereden</span>
                          <span className="font-medium">{search.from}</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500">Nereye</span>
                          <span className="font-medium">{search.to}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500">Tarih</span>
                          <span className="font-medium">{search.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500">Yolcular</span>
                          <span className="font-medium">{search.passengers}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      Tekrar Ara
                    </button>
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    Arama Tarihi: {search.searchDate}
                  </div>
                </div>
              ))}
            </div>

            {searches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Henüz bir arama yapmadınız.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
} 