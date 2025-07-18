'use client';

import { useState } from 'react';
import Header from '@/components/Header';
// import { getReservationByPNR, getOrderRouteAirRulesBiletDukkaniReal, cancelOrderBiletDukkaniReal, refundValidateBiletDukkaniReal } from '@/services/flightApi'; // TODO: getReservationByPNR fonksiyonu gerçek API entegrasyonu tamamlandığında aktif edilecek.
import { PlaneTakeoff, User, Calendar, XCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { getOrderRouteAirRulesBiletDukkaniReal, cancelOrderBiletDukkaniReal, refundValidateBiletDukkaniReal } from '@/services/flightApi';

export default function BiletIptalPage() {
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reservation, setReservation] = useState<any>(null);
  const [error, setError] = useState('');
  const [cancellationStatus, setCancellationStatus] = useState<{success: boolean, message: string} | null>(null);
  const [airRules, setAirRules] = useState<any[]>([]);
  const [airRulesLoading, setAirRulesLoading] = useState(false);
  const [airRulesError, setAirRulesError] = useState('');
  const [refundInfo, setRefundInfo] = useState<any>(null);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setReservation(null);
    setCancellationStatus(null);
    setAirRules([]);
    setAirRulesError('');
    setAirRulesLoading(true);
    try {
      // const result = await getReservationByPNR(pnr, lastName); // TODO: getReservationByPNR fonksiyonu gerçek API entegrasyonu tamamlandığında aktif edilecek.
      // Demo amaçlı sabit token ve id'ler, gerçek API'de dinamik alınacak
      const token = 'DEMO_TOKEN';
      const rules = await getOrderRouteAirRulesBiletDukkaniReal(reservation.orderId || 'demo-order-id', reservation.routeId || 'demo-route-id', token);
      setAirRules(rules);
    } catch (err: any) {
      setError(err.message || 'Rezervasyon bulunamadı.');
    } finally {
      setIsLoading(false);
      setAirRulesLoading(false);
    }
  };
  
  const handleCancelBooking = async () => {
    if (!reservation) return;
    setIsLoading(true);
    setError('');
    setCancellationStatus(null);
    try {
      // Demo amaçlı sabit token ve id'ler, gerçek API'de dinamik alınacak
      const token = 'DEMO_TOKEN';
      const result = await cancelOrderBiletDukkaniReal(reservation.orderId || 'demo-order-id', token);
      setCancellationStatus({ success: result.success, message: result.success ? 'Bilet başarıyla iptal edildi.' : 'İptal işlemi başarısız.' });
      if(result.success) {
        setReservation(null); // İptal sonrası rezervasyonu temizle
      }
    } catch (err: any) {
      setError(err.message || 'İptal işlemi başarısız.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleRefundValidate = async () => {
    if (!reservation) return;
    setRefundLoading(true);
    setRefundError('');
    setRefundInfo(null);
    try {
      const token = 'DEMO_TOKEN';
      const info = await refundValidateBiletDukkaniReal(reservation.orderId || 'demo-order-id', token);
      setRefundInfo(info);
      setShowRefundModal(true);
    } catch (err: any) {
      setRefundError(err.message || 'İade sorgulama işlemi başarısız.');
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bilet İptal</h1>
            <p className="text-gray-600">PNR ve soyadınız ile biletinizi sorgulayıp iptal edebilirsiniz.</p>
          </div>

          {!reservation && !cancellationStatus && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PNR (Rezervasyon Kodu)</label>
                  <input
                    type="text"
                    value={pnr}
                    onChange={e => setPnr(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soyadınız</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? 'Sorgulanıyor...' : 'Bileti Bul'}
                </button>
              </form>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Hata: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {cancellationStatus && (
             <div className={`p-4 rounded-lg text-center ${cancellationStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {cancellationStatus.success ? <CheckCircle className="w-12 h-12 mx-auto mb-2" /> : <AlertTriangle className="w-12 h-12 mx-auto mb-2" />}
                <p className="font-semibold">{cancellationStatus.message}</p>
             </div>
          )}

          {reservation && !cancellationStatus &&(
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Rezervasyon Detayları</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>PNR:</strong> {reservation.pnr}</p>
                <p><strong>Yolcu:</strong> {reservation.passenger.firstName} {reservation.passenger.lastName}</p>
                <p><strong>Uçuş:</strong> {reservation.flight.airlineName} - {reservation.flight.flightNumber}</p>
                <p><strong>Rota:</strong> {reservation.flight.origin} → {reservation.flight.destination}</p>
                <p><strong>Tarih:</strong> {new Date(reservation.flight.departureTime).toLocaleDateString('tr-TR')}</p>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-yellow-800">İptal Koşulları</h3>
                        {airRulesLoading && <div className="text-xs text-gray-500 mt-1">Kurallar yükleniyor...</div>}
                        {airRulesError && <div className="text-xs text-red-500 mt-1">{airRulesError}</div>}
                        {airRules && airRules.length > 0 && (
                          <ul className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-gray-700 space-y-1">
                            {airRules.map((rule, idx) => (
                              <li key={idx}><span className="font-semibold text-yellow-800">{rule.title}:</span> {rule.detail}</li>
                            ))}
                          </ul>
                        )}
                        {!airRulesLoading && !airRules.length && <p className="text-sm text-yellow-700">Biletinizi iptal etmek istediğinizden emin misiniz? Havayolu kurallarına bağlı olarak ücret kesintisi uygulanabilir.</p>}
                    </div>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={handleRefundValidate}
                  disabled={refundLoading || isLoading}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {refundLoading ? 'İade Bilgisi Sorgulanıyor...' : 'İptal Et & İade Al'}
                </button>
              </div>
              {refundError && <div className="text-xs text-red-500 mt-2">{refundError}</div>}

              {/* Refund Modal */}
              {showRefundModal && refundInfo && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200">
                    <h3 className="text-xl font-bold mb-4 text-blue-700 text-center">İade Bilgisi</h3>
                    <div className="mb-4 text-gray-700">
                      <p><b>Toplam İade:</b> {refundInfo.totalRefundPrice} {refundInfo.currencyCode}</p>
                      {refundInfo.passengerRefunds && refundInfo.passengerRefunds.length > 0 && (
                        <ul className="mt-2 text-sm">
                          {refundInfo.passengerRefunds.map((p: any, idx: number) => (
                            <li key={idx} className="mb-1">{p.firstName} {p.lastName}: {p.refundPrice} {refundInfo.currencyCode} (Ceza: {p.penalty} {refundInfo.currencyCode})</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex gap-2 mt-6">
                      <button
                        onClick={async () => { setShowRefundModal(false); await handleCancelBooking(); }}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
                      >
                        Onayla ve İptal Et
                      </button>
                      <button
                        onClick={() => setShowRefundModal(false)}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
                      >
                        Vazgeç
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/" className="text-green-600 hover:underline">
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 