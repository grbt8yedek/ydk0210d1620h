'use client';

import { PlaneTakeoff, PlaneLanding } from 'lucide-react';

interface FlightDetailsCardProps {
    flight: any;
}

export default function FlightDetailsCard({ flight }: FlightDetailsCardProps) {
    // MOBİLDE DAHA KÜÇÜK VE SIKI TASARIM (geri alınabilir)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (!flight) return null;

    return (
        <div className={`bg-white rounded-lg shadow-md ${isMobile ? 'p-3' : 'p-6'} mb-6`}>
            <h2 className={`text-xl font-bold text-gray-800 mb-4 ${isMobile ? 'mb-2' : ''}`}>Uçuş Detayları</h2>
            <div className={`flex items-center justify-between border-b pb-4 mb-4 ${isMobile ? 'pb-2 mb-2' : ''}`}>
                <div className="flex flex-col items-center flex-1">
                    <span className="font-bold text-base sm:text-lg">{flight.origin}</span>
                    {isMobile ? (
                      <span className="flex flex-col items-center text-gray-500 text-xs mt-1 w-full">
                        <span className="flex items-center gap-1 justify-center w-full">
                          <PlaneTakeoff className="w-4 h-4 text-green-600" />
                          {flight.departureTime ? new Date(flight.departureTime).toLocaleDateString('tr-TR') : ''}
                        </span>
                        <span className="block w-full text-center">{flight.departureTime?.slice(11, 16)}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <PlaneTakeoff className="w-6 h-6 text-green-600" />
                        {flight.departureTime ? new Date(flight.departureTime).toLocaleDateString('tr-TR') : ''} - {flight.departureTime?.slice(11, 16)}
                      </span>
                    )}
                </div>
                <div className="flex flex-col items-center flex-1 min-w-0">
                    <span className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>{flight.duration}</span>
                    <span className={`text-green-600 font-semibold ${isMobile ? 'text-xs mt-[-2px]' : 'text-sm'}`}>{flight.direct ? 'Direkt' : 'Aktarmalı'}</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                    <span className="font-bold text-base sm:text-lg">{flight.destination}</span>
                    {isMobile ? (
                      <span className="flex flex-col items-center text-gray-500 text-xs mt-1 w-full">
                        <span className="flex items-center gap-1 justify-center w-full">
                          {flight.arrivalTime ? new Date(flight.arrivalTime).toLocaleDateString('tr-TR') : ''}
                          <PlaneLanding className="w-4 h-4 text-green-600" />
                        </span>
                        <span className="block w-full text-center">{flight.arrivalTime?.slice(11, 16)}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-500 text-sm">
                        {flight.arrivalTime ? new Date(flight.arrivalTime).toLocaleDateString('tr-TR') : ''} - {flight.arrivalTime?.slice(11, 16)}
                        <PlaneLanding className="w-6 h-6 text-green-600" />
                      </span>
                    )}
                </div>
            </div>
            <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>{flight.airlineName} - {flight.flightNumber}</div>
        </div>
    );
} 