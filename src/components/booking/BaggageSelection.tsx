'use client';

import { Briefcase, PlaneTakeoff } from 'lucide-react';

const BAGGAGE_OPTIONS = [
    { weight: 0, label: 'Sadece Kabin Bagajı', price: -10 }, // Fiyattan düşülebilir
    { weight: 20, label: '20 kg Bagaj (Standart)', price: 0 },
    { weight: 25, label: '25 kg Bagaj', price: 15 },
    { weight: 30, label: '30 kg Bagaj', price: 25 },
];

interface BaggageSelectionProps {
    passengers: any[];
    flight: any;
    onBaggageChange: (passengerIndex: number, legIndex: number, baggage: any) => void;
    baggageSelections: any[];
}

export default function BaggageSelection({ passengers, flight, onBaggageChange, baggageSelections }: BaggageSelectionProps) {
    if (!passengers || passengers.length === 0) return null;

    const flightLegs = [{ type: 'Gidiş', flight }]; // Gelecekte dönüş uçuşu buraya eklenebilir: { type: 'Dönüş', flight: returnFlight }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Briefcase className="text-green-600"/> Bagaj hakkını yükselt
            </h2>
            <p className="text-sm text-gray-600 mb-6">Havalimanında bagajınıza yüksek fiyatlar ödemeyin, %50'ye varan fiyat avantajıyla şimdiden bagaj hakkınızı yükseltin.</p>
            <div className="space-y-4">
                {passengers.map((passenger, pIndex) => (
                    <div key={`passenger-baggage-${pIndex}`}>
                        {flightLegs.map((leg, lIndex) => (
                             <div key={`leg-${lIndex}`} className="p-4 border rounded-lg bg-gray-50">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800">{`${pIndex + 1}. ${passenger.type || 'Yolcu'}`}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <PlaneTakeoff size={16} className="text-orange-500"/>
                                            <p className="text-sm font-semibold">{leg.type} ({leg.flight.origin}-{leg.flight.destination})</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Bagaj hakkı 1x{leg.flight.baggage || '20kg'}</p>
                                    </div>
                                    <div className="w-full sm:w-48">
                                         <label className="block text-xs text-gray-500 mb-1">Ek check-in bagajı</label>
                                         <select
                                            className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                            value={baggageSelections[pIndex]?.[lIndex]?.price ?? 0}
                                            onChange={(e) => {
                                                const selectedOption = BAGGAGE_OPTIONS.find(opt => opt.price === parseInt(e.target.value));
                                                onBaggageChange(pIndex, lIndex, selectedOption);
                                            }}
                                         >
                                            {BAGGAGE_OPTIONS.map(opt => (
                                                <option key={opt.weight} value={opt.price}>
                                                    {opt.label} {opt.price > 0 ? `(+${opt.price} EUR)` : opt.price < 0 ? `(${opt.price} EUR)`: '(Dahil)'}
                                                </option>
                                            ))}
                                         </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
} 