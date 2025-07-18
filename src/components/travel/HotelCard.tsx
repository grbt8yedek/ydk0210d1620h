'use client';

import { HotelReservation } from '@/types/travel';

interface HotelCardProps {
  hotel: HotelReservation;
  openDetailId: string | null;
  onToggleDetail: (hotelId: string) => void;
}

export default function HotelCard({ hotel, openDetailId, onToggleDetail }: HotelCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOpen = openDetailId === hotel.id;

  return (
    <div className="border rounded-xl p-4 bg-gray-50">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-lg text-blue-700">{hotel.hotelName}</div>
          <div className="text-sm text-gray-500">{hotel.location}</div>
          <div className="text-sm text-gray-500">
            Giriş: {formatDate(hotel.checkIn)} {hotel.checkInTime} <b>• Çıkış:</b> {formatDate(hotel.checkOut)} {hotel.checkOutTime}
          </div>
          <div className="text-sm text-gray-500">Oda: {hotel.roomType}</div>
          <div className="text-sm text-gray-500">
            Konuklar: {hotel.guests.map(g => g.name).join(', ')}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-lg font-bold text-gray-800">{hotel.price}</div>
          <div className="text-xs text-green-600">{hotel.status}</div>
          <button
            className="mt-2 px-4 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
            onClick={() => onToggleDetail(hotel.id)}
          >
            Detay
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="mt-4 p-4 bg-white rounded-xl border text-left">
          <div className="mb-2 text-base font-semibold text-gray-700">Otel Bilgileri</div>
          <div className="mb-2 text-sm text-gray-700"><b>Otel:</b> {hotel.hotelName}</div>
          <div className="mb-2 text-sm text-gray-700"><b>Adres:</b> {hotel.address}</div>
          <div className="mb-2 text-sm text-gray-700"><b>Telefon:</b> {hotel.phone}</div>
          <div className="mb-2 text-sm text-gray-700">
            <b>Giriş Tarihi:</b> {formatDate(hotel.checkIn)} {hotel.checkInTime}
          </div>
          <div className="mb-2 text-sm text-gray-700">
            <b>Çıkış Tarihi:</b> {formatDate(hotel.checkOut)} {hotel.checkOutTime}
          </div>
          <div className="mb-2 text-sm text-gray-700"><b>Oda Tipi:</b> {hotel.roomType}</div>
          <div className="mb-2 text-sm text-gray-700">
            <b>Konuklar:</b> {hotel.guests.map(g => g.name + ' (' + g.type + ')').join(', ')}
          </div>
          <div className="mb-2 text-sm text-gray-700"><b>Rezervasyon No:</b> {hotel.reservationNo}</div>
          <div className="mb-2 text-sm text-gray-700"><b>Durum:</b> {hotel.status}</div>
          <div className="mb-2 text-sm text-gray-700"><b>Fiyat:</b> {hotel.price}</div>
          <div className="mb-2 text-sm text-gray-700"><b>Ödeme:</b> {hotel.payment}</div>
          <div className="mb-2 text-sm text-gray-700"><b>Kurallar:</b> {hotel.rules}</div>
          <div className="mb-2 text-sm text-gray-700">
            <b>Ek Hizmetler:</b> {hotel.services.join(', ')}
          </div>
          <div className="mb-2 text-sm text-gray-700"><b>Notlar:</b> {hotel.notes}</div>
        </div>
      )}
    </div>
  );
} 