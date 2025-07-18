'use client';

import { Shield, Lock } from 'lucide-react';

interface PriceSummaryProps {
    totalPassengers: number;
    baseTotalPrice: number;
    totalBaggagePrice: number;
    taxes: number;
    finalTotalPrice: number;
    termsAccepted: boolean;
    bookingType: 'reserve' | 'book';
    onTermsChange: (accepted: boolean) => void;
    onBookingTypeChange: (type: 'reserve' | 'book') => void;
    onProceedToPayment: () => void;
}

export default function PriceSummary({
    totalPassengers,
    baseTotalPrice,
    totalBaggagePrice,
    taxes,
    finalTotalPrice,
    termsAccepted,
    bookingType,
    onTermsChange,
    onBookingTypeChange,
    onProceedToPayment
}: PriceSummaryProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Fiyat Özeti</h2>
            <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Bilet Fiyatı (x{totalPassengers})</span>
                <span className="font-semibold">{baseTotalPrice.toFixed(2)} EUR</span>
            </div>
            {totalBaggagePrice !== 0 && (
                <div className="flex justify-between items-center mb-2 text-sm text-blue-600">
                    <span className="font-medium">Ek Bagaj Ücreti</span>
                    <span className="font-semibold">{totalBaggagePrice.toFixed(2)} EUR</span>
                </div>
            )}
            <div className="flex justify-between items-center mb-2 text-sm">
                <span className="text-gray-500">Vergiler ve Harçlar</span>
                <span className="font-semibold">{taxes.toFixed(2)} EUR</span>
            </div>
            <div className="border-t my-4"></div>
            <div className="flex justify-between items-center font-bold text-lg">
                <span>Toplam</span>
                <span>{finalTotalPrice.toFixed(2)} EUR</span>
            </div>

            <div className="mt-6">
                <label htmlFor="terms" className="flex items-start cursor-pointer">
                    <input 
                        id="terms" 
                        type="checkbox" 
                        checked={termsAccepted}
                        onChange={(e) => onTermsChange(e.target.checked)}
                        className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="ml-2 text-xs text-gray-600">
                        <a href="#" className="underline hover:text-green-700">Havayolu Taşıma Kuralları</a>'nı, 
                        <a href="#" className="underline hover:text-green-700"> Kullanım Şartları</a>'nı ve 
                        <a href="#" className="underline hover:text-green-700"> Gizlilik Politikası</a>'nı okudum, anladım ve kabul ediyorum.
                    </span>
                </label>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">İşlem Tipi</label>
                <div className="flex gap-4">
                    <label>
                        <input
                            type="radio"
                            name="bookingType"
                            value="reserve"
                            checked={bookingType === 'reserve'}
                            onChange={() => onBookingTypeChange('reserve')}
                        />
                        <span className="ml-1">Rezervasyon Yap</span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="bookingType"
                            value="book"
                            checked={bookingType === 'book'}
                            onChange={() => onBookingTypeChange('book')}
                        />
                        <span className="ml-1">Bileti Al</span>
                    </label>
                </div>
            </div>

            <button 
                onClick={onProceedToPayment} 
                className="w-full mt-4 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!termsAccepted}
            >
                <Shield size={20} /> Ödemeye İlerle
            </button>

            <div className="mt-4 space-y-2">
                <div className="flex justify-center items-center gap-4 text-gray-400">
                    <p className="font-bold text-sm">VISA</p>
                    <p className="font-bold text-sm">Mastercard</p>
                    <p className="font-bold text-sm">Klarna</p>
                    <p className="font-bold text-sm">PayPal</p>
                </div>
                <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5">
                    <Lock size={12} />
                    <span>SSL ile korunan güvenli ödeme</span>
                </div>
            </div>
        </div>
    );
} 