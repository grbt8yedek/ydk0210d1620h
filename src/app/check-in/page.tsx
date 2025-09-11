'use client';

import { useState } from 'react';
import { PlaneTakeoff, User, Calendar, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function CheckInPage() {
  const [bookingRef, setBookingRef] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkInResult, setCheckInResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setCheckInResult(null);

    try {
      // Demo timeout kaldırıldı - sistem daha hızlı
      // await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Demo sonuç
      setCheckInResult({
        success: true,
        booking: {
          reference: bookingRef,
          passenger: `${lastName} Ailesi`,
          flight: 'TK123',
          origin: 'IST',
          destination: 'AMS',
          departure: '2024-01-15T09:00:00',
          arrival: '2024-01-15T11:30:00',
          airline: 'Turkish Airlines',
          seat: '12A',
          gate: 'A15',
          boardingTime: '08:30'
        }
      });
    } catch (err) {
      setError('Check-in işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <PlaneTakeoff className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Online Check-in</h1>
            </div>
            <p className="text-gray-600">
              Uçuşunuzdan 24 saat önce online check-in yapabilirsiniz
            </p>
          </div>

          {/* Check-in Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Rezervasyon Bilgilerinizi Girin
            </h2>
            
            <form onSubmit={handleCheckIn} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rezervasyon Referansı
                  </label>
                  <input
                    type="text"
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Örn: ABC123456"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soyadınız
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Soyadınızı girin"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Check-in Yapılıyor...' : 'Check-in Yap'}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Check-in Result */}
          {checkInResult && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlaneTakeoff className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Check-in Başarılı!
                </h2>
                <p className="text-gray-600">
                  Uçuş bilgileriniz aşağıda yer almaktadır
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Yolcu</p>
                      <p className="font-medium">{checkInResult.booking.passenger}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <PlaneTakeoff className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Uçuş</p>
                      <p className="font-medium">{checkInResult.booking.flight} - {checkInResult.booking.airline}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Rota</p>
                      <p className="font-medium">{checkInResult.booking.origin} → {checkInResult.booking.destination}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Kalkış</p>
                      <p className="font-medium">
                        {new Date(checkInResult.booking.departure).toLocaleDateString('tr-TR')} - {new Date(checkInResult.booking.departure).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Boarding</p>
                      <p className="font-medium">{checkInResult.booking.boardingTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Kapı</p>
                      <p className="font-medium">{checkInResult.booking.gate}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">!</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">Koltuk: {checkInResult.booking.seat}</p>
                    <p className="text-sm text-blue-600">
                      Boarding kartınızı yazdırmayı unutmayın
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Check-in Hakkında
            </h3>
            <div className="space-y-3 text-gray-600">
              <p>• Check-in işlemini uçuşunuzdan 24 saat önce yapabilirsiniz</p>
              <p>• Rezervasyon referansınızı biletinizde bulabilirsiniz</p>
              <p>• Soyadınızı biletinizdeki gibi yazın</p>
              <p>• Check-in sonrası boarding kartınızı yazdırın</p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 