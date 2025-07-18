'use client';

import { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { FlightReservation } from '@/types/travel';
import { getAirlineCheckInUrl } from '@/utils/airlines';
import { getOrderRouteAirRulesBiletDukkaniReal } from '@/services/flightApi';

interface FlightCardProps {
  flight: FlightReservation;
  airRules: { [flightId: string]: any[] };
  airRulesLoading: string | null;
  airRulesError: string | null;
  onOpenDetail: (flight: FlightReservation) => void;
  openDetailId: string | null;
}

export default function FlightCard({ 
  flight, 
  airRules, 
  airRulesLoading, 
  airRulesError, 
  onOpenDetail, 
  openDetailId 
}: FlightCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const checkInUrl = getAirlineCheckInUrl(flight.airline);
  const isOpen = openDetailId === flight.id;

  return (
    <div className="border rounded-xl sm:p-4 p-2 bg-gray-50">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-bold sm:text-lg text-base">{flight.from} → {flight.to}</div>
          <div className="text-sm text-gray-600">
            {formatDate(flight.date)} • {flight.time}
            {flight.arrivalTime ? ` - ${flight.arrivalTime}` : ""} • {flight.airline}
          </div>
          <div className="text-xs text-gray-500 mt-1">PNR: {flight.pnr}</div>
          <div className="text-xs text-gray-500">
            Yolcu: {flight.passengers.map(p => p.name).join(', ')}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold sm:text-xl text-base">{flight.price}</div>
          <div className="text-xs text-green-600">{flight.status}</div>
          <button
            onClick={() => onOpenDetail(flight)}
            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-300"
          >
            Detay
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="mt-2 pt-2 border-t">
          <div className="mb-2 text-sm font-semibold text-gray-700">Yolcular</div>
          <table className="w-full mb-2 text-xs">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left py-1">Ad Soyad</th>
                <th className="text-left py-1">Koltuk</th>
                <th className="text-left py-1">Bagaj</th>
                <th className="text-left py-1">Bilet Tipi</th>
              </tr>
            </thead>
            <tbody>
              {flight.passengers.map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="py-1">{p.name}</td>
                  <td className="py-1">{p.seat}</td>
                  <td className="py-1">{p.baggage}</td>
                  <td className="py-1">{p.ticketType}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="grid grid-cols-2 gap-1 mb-2 text-xs text-gray-700">
            <div><b>PNR:</b> {flight.pnr}</div>
            <div><b>Havayolu:</b> {flight.airline}</div>
            <div><b>Gidiş Tarihi:</b> {formatDate(flight.date)}</div>
            <div><b>Gidiş Saati:</b> {flight.time}{flight.arrivalTime ? ` - ${flight.arrivalTime}` : ""}</div>
            <div><b>Durum:</b> {flight.status}</div>
            <div><b>Fiyat:</b> {flight.price}</div>
          </div>
          
          <div className="mb-2 text-xs text-gray-700">
            <b>Ödeme:</b> {flight.details.payment}
          </div>
          
          {/* Bilet Kuralları */}
          <div className="mb-2 text-xs text-gray-700">
            <b>Bilet Kuralları:</b>
            {airRulesLoading === flight.id && (
              <div className="text-xs text-gray-500 mt-1">Kurallar yükleniyor...</div>
            )}
            {airRulesError && (
              <div className="text-xs text-red-500 mt-1">{airRulesError}</div>
            )}
            {airRules[flight.id] && airRules[flight.id].length > 0 && (
              <ul className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-gray-700 space-y-1">
                {airRules[flight.id].map((rule, idx) => (
                  <li key={idx}>
                    <span className="font-semibold text-green-800">{rule.title}:</span> {rule.detail}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => window.open(checkInUrl, '_blank', 'noopener,noreferrer')}
              disabled={!checkInUrl}
              title={checkInUrl ? 'Online check-in sayfasına git' : 'Bu havayolu için otomatik yönlendirme bulunmuyor.'}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Online Check-in
            </button>
            <button
              disabled
              title="Yakında"
              className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-lg cursor-not-allowed flex items-center gap-1"
            >
              <Briefcase size={12} />
              Ek Hizmet Ekle
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 