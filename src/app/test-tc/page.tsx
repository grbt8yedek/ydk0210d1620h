'use client';

import { useState } from 'react';
import PassengerForm from '@/components/booking/PassengerForm';

const testFlight = {
    id: '123',
    from: 'IST',
    to: 'ESB',
    departureTime: '2024-01-15T10:00:00',
    arrivalTime: '2024-01-15T11:30:00',
    airline: 'Turkish Airlines',
    price: 100,
    flightNumber: 'TK123'
};

export default function TestTCPage() {
    const [passengerData, setPassengerData] = useState({
        id: null,
        firstName: '',
        lastName: '',
        birthDay: '',
        birthMonth: '',
        birthYear: '',
        gender: '',
        identityNumber: '',
        isForeigner: false,
        shouldSave: false,
        type: 'Yetişkin' as const
    });

    const handleFormChange = (field: string, value: any) => {
        console.log('Form change:', { field, value });
        setPassengerData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-2xl font-bold mb-6">TC Kimlik No Test Page</h1>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <PassengerForm 
                        passengerNumber={1}
                        passengerType="Yetişkin"
                        savedPassengers={[]}
                        onSelectPassenger={() => {}}
                        onFormChange={handleFormChange}
                        passengerData={passengerData}
                        onSaveToggle={() => {}}
                        shouldSave={false}
                        flight={testFlight}
                    />
                </div>
                <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Current State:</h2>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                        {JSON.stringify(passengerData, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
