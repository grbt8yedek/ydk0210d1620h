'use client';

import { useState, useEffect } from 'react';
import { User, Edit, Trash2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useSession, signOut } from 'next-auth/react';

interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  identityNumber: string | null;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  hasMilCard: boolean;
  isAccountOwner?: boolean;
}

export default function YolcularimPage() {
  const router = useRouter();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleLogout = () => { signOut({ callbackUrl: '/' }); };

  // Yolcu listesini getir
  useEffect(() => {
    const fetchPassengers = async () => {
      try {
        const response = await fetch('/api/passengers');
        if (!response.ok) {
          throw new Error('Yolcu listesi getirilemedi');
        }
        const data = await response.json();
        setPassengers(data);
      } catch (error) {
        console.error('Yolcu listesi getirme hatası:', error);
        toast.error('Yolcu listesi getirilemedi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPassengers();
  }, []);

  const handleEdit = (passengerId: string) => {
    router.push(`/hesabim/yolcularim/duzenle?id=${passengerId}`);
  };

  const handleDelete = async (passengerId: string) => {
    if (!window.confirm('Bu yolcuyu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/passengers/${passengerId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Yolcu silinemedi');
      }

      // Yolcuyu listeden kaldır
      setPassengers(passengers.filter(p => p.id !== passengerId));
      toast.success('Yolcu başarıyla silindi');
    } catch (error) {
      console.error('Yolcu silme hatası:', error);
      toast.error('Yolcu silinirken bir hata oluştu');
    }
  };

  const formatDate = (day: string, month: string, year: string) => {
    if (!day || !month || !year) return '-';
    
    // Ay değerini sayısal'dan string'e çevir
    const monthNames = [
      'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
      'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'
    ];
    
    const monthIndex = parseInt(month) - 1;
    const monthAbbr = monthNames[monthIndex] || month;
    
    // Gün değerini iki haneli yap
    const formattedDay = day.padStart(2, '0');
    
    return `${formattedDay} ${monthAbbr} ${year}`;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="sm:container sm:mx-auto sm:px-4 sm:py-8 container mx-auto px-2 py-4">
        <div className="sm:flex sm:gap-8 flex flex-col gap-2">
          
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h1 className="sm:text-2xl text-lg text-gray-700 font-medium">Yolcularım</h1>
              <button
                onClick={() => router.push('/hesabim/yolcularim/duzenle')}
                className="flex items-center gap-2 sm:px-4 sm:py-2 px-2 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-xs sm:text-base"
              >
                <Plus className="w-5 h-5" />
                <span>Yeni Yolcu</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              {/* Header */}
              <div className="sm:grid sm:grid-cols-12 sm:gap-4 sm:px-6 sm:py-4 sm:text-sm grid grid-cols-4 gap-1 px-2 py-2 text-xs border-b border-gray-100 text-gray-500">
                <div className="sm:col-span-4 col-span-2">Adı - Soyadı</div>
                <div className="sm:col-span-3 col-span-1">T.C. No</div>
                <div className="sm:col-span-3 col-span-1">Doğum Tarihi</div>
                <div className="sm:col-span-1 flex"></div>
                <div className="sm:col-span-1 flex"></div>
              </div>

              {/* Passengers List */}
              {/* MOBILE KART TASARIM BAŞLANGIÇ */}
              <div className="sm:hidden flex flex-col gap-2">
                {isLoading ? (
                  <div className="text-center py-4 text-gray-500 text-xs">Yolcular yükleniyor...</div>
                ) : (
                  <>
                    {(() => {
                      const owner = passengers.find(p => p.isAccountOwner);
                      const others = passengers.filter(p => !p.isAccountOwner);
                      const sorted = owner ? [owner, ...others] : others;
                      return sorted.map((passenger) => (
                        <div key={passenger.id} className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900 flex items-center gap-1">
                              {passenger.firstName} {passenger.lastName}
                              {passenger.isAccountOwner && (
                                <span className="ml-1 text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">Hesap Sahibi</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">{passenger.identityNumber || '-'}</div>
                            <div className="text-xs text-gray-600">{formatDate(passenger.birthDay, passenger.birthMonth, passenger.birthYear)}</div>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <button className="p-1 text-gray-400 hover:text-blue-600" onClick={() => handleEdit(passenger.id)}>
                              <Edit className="w-4 h-4" />
                            </button>
                            {!passenger.isAccountOwner && (
                              <button className="p-1 text-gray-400 hover:text-red-600" onClick={() => handleDelete(passenger.id)}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                    {passengers.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-xs">Henüz yolcu eklenmemiş.</div>
                    )}
                  </>
                )}
              </div>
              {/* MOBILE KART TASARIM BİTİŞ */}

              {/* Eski tablo/grid görünümü sadece sm ve üstü için kalsın: */}
              <div className="hidden sm:block">
                {isLoading ? (
                  <div className="text-center sm:py-8 py-4 text-gray-500 text-xs">Yolcular yükleniyor...</div>
                ) : (
                  <>
                    {(() => {
                      // isAccountOwner true olanı başa al, diğerleri altına gelsin
                      const owner = passengers.find(p => p.isAccountOwner);
                      const others = passengers.filter(p => !p.isAccountOwner);
                      const sorted = owner ? [owner, ...others] : others;
                      return sorted.map((passenger) => (
                        <div 
                          key={passenger.id}
                          className="sm:grid sm:grid-cols-12 sm:gap-4 sm:px-6 sm:py-4 sm:items-center grid grid-cols-4 gap-1 px-2 py-2 items-center hover:bg-gray-50 transition-colors"
                        >
                          <div className="sm:col-span-4 col-span-2 flex items-center gap-2 sm:gap-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-50 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <span className="font-medium text-xs sm:text-base">{passenger.firstName} {passenger.lastName}</span>
                              {passenger.isAccountOwner && (
                                <span className="ml-2 text-[10px] sm:text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">Hesap Sahibi</span>
                              )}
                            </div>
                          </div>
                          <div className="sm:col-span-3 col-span-1 text-gray-600 text-xs sm:text-base">{passenger.identityNumber || '-'}</div>
                          <div className="sm:col-span-3 col-span-1 text-gray-600 text-xs sm:text-base">{formatDate(passenger.birthDay, passenger.birthMonth, passenger.birthYear)}</div>
                          <div className="sm:col-span-1 flex">{passenger.hasMilCard && (<div className="w-2 h-2 bg-green-500 rounded-full"></div>)}</div>
                          <div className="sm:col-span-1 flex">
                            <div className="flex items-center gap-2 justify-end">
                              <button 
                                className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={() => handleEdit(passenger.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {!passenger.isAccountOwner && (
                                <button 
                                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                                  onClick={() => handleDelete(passenger.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ));
                    })()}

                    {passengers.length === 0 && (
                      <div className="text-center sm:py-8 py-4 text-gray-500 text-xs">Henüz yolcu eklenmemiş.</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 