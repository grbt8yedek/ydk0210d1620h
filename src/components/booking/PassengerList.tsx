'use client';

import { User } from 'lucide-react';
import PassengerForm from './PassengerForm';

interface PassengerDetail {
    id: string | null;
    firstName: string;
    lastName: string;
    birthDay: string;
    birthMonth: string;
    birthYear: string;
    gender: string;
    identityNumber: string;
    isForeigner: boolean;
    shouldSave: boolean;
    type: 'Yetişkin' | 'Çocuk';
}

interface PassengerListProps {
    passengers: { adults: number; children: number; infants: number };
    passengerDetails: PassengerDetail[];
    savedPassengers: any[];
    flight: any;
    onSelectSavedPassenger: (passengerIndex: number, passengerData: any | null) => void;
    onPassengerFormChange: (passengerIndex: number, field: string, value: any) => void;
    onSaveToggle: (passengerIndex: number, checked: boolean) => void;
}

export default function PassengerList({
    passengers,
    passengerDetails,
    savedPassengers,
    flight,
    onSelectSavedPassenger,
    onPassengerFormChange,
    onSaveToggle
}: PassengerListProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User /> Yolcu Bilgileri
            </h2>
            {Array.from({ length: passengers.adults }).map((_, index) => (
                <PassengerForm 
                    key={`adult-${index}`} 
                    passengerNumber={index + 1} 
                    passengerType="Yetişkin"
                    savedPassengers={savedPassengers.filter(p => 
                        !passengerDetails.some(pd => pd.id === p.id && passengerDetails[index]?.id !== p.id)
                    )}
                    onSelectPassenger={(p) => onSelectSavedPassenger(index, p)}
                    onFormChange={(field, value) => onPassengerFormChange(index, field, value)}
                    passengerData={passengerDetails[index]}
                    onSaveToggle={(checked) => onSaveToggle(index, checked)}
                    shouldSave={passengerDetails[index]?.shouldSave}
                    flight={flight}
                />
            ))}
            {Array.from({ length: passengers.children }).map((_, index) => {
                const passengerIndex = index + passengers.adults;
                return (
                <PassengerForm 
                    key={`child-${index}`} 
                    passengerNumber={passengerIndex + 1} 
                    passengerType="Çocuk"
                    savedPassengers={savedPassengers.filter(p => 
                        !passengerDetails.some(pd => pd.id === p.id && passengerDetails[passengerIndex]?.id !== p.id)
                    )}
                    onSelectPassenger={(p) => onSelectSavedPassenger(passengerIndex, p)}
                    onFormChange={(field, value) => onPassengerFormChange(passengerIndex, field, value)}
                    passengerData={passengerDetails[passengerIndex]}
                    onSaveToggle={(checked) => onSaveToggle(passengerIndex, checked)}
                    shouldSave={passengerDetails[passengerIndex]?.shouldSave}
                    flight={flight}
                />
            )})}
        </div>
    );
} 