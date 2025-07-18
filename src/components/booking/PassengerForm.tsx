'use client';

import { useState } from 'react';

interface PassengerFormProps {
    passengerNumber: number;
    passengerType: 'Yetişkin' | 'Çocuk';
    savedPassengers: any[];
    onSelectPassenger: (passenger: any | null) => void;
    onFormChange: (field: string, value: any) => void;
    passengerData: any;
    onSaveToggle: (checked: boolean) => void;
    shouldSave: boolean;
    flight: any;
}

export default function PassengerForm({ 
    passengerNumber, 
    passengerType,
    savedPassengers,
    onSelectPassenger,
    onFormChange,
    passengerData,
    onSaveToggle,
    shouldSave,
    flight
}: PassengerFormProps) {
    const [activePassengerId, setActivePassengerId] = useState<string | null>(passengerData.id || null);
    const [isModified, setIsModified] = useState(false);

    const handleSelect = (passenger: any) => {
        onSelectPassenger(passenger);
        setActivePassengerId(passenger.id);
        setIsModified(false);
    };

    const handleNew = () => {
        onSelectPassenger(null); // Clear form data in parent
        setActivePassengerId(null);
        setIsModified(false);
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setIsModified(true);
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        // @ts-ignore
        const formValue = isCheckbox ? e.target.checked : value;
        
        onFormChange(name, formValue);

        if (name === 'isForeigner' && isCheckbox) {
             // @ts-ignore
            if (e.target.checked) {
                onFormChange('identityNumber', '');
            }
        }
    };

    return (
        <div className="mb-8 p-4 border rounded-lg bg-white">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{`${passengerNumber}. ${passengerType}`}</h3>
            
            {savedPassengers && savedPassengers.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-semibold text-green-800 mb-3">YOLCU LİSTEMDEN SEÇ</p>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={handleNew}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg ${!activePassengerId ? 'bg-green-600 text-white' : 'bg-white text-green-600 border border-green-600'}`}
                        >
                            Yeni Kişi
                        </button>
                        {savedPassengers.map((p: any) => (
                            <button 
                                key={p.id} 
                                onClick={() => handleSelect(p)}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg ${activePassengerId === p.id ? 'bg-green-600 text-white' : 'bg-white text-green-600 border border-green-600'}`}
                            >
                                {p.firstName} {p.lastName.charAt(0)}.
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                 <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Cinsiyet:</label>
                    <div className="flex items-center gap-4">
                         <label className="flex items-center">
                            <input type="radio" name="gender" value="male" checked={passengerData.gender === 'male'} onChange={handleChange} className="form-radio text-green-600" />
                            <span className="ml-2">Erkek</span>
                        </label>
                         <label className="flex items-center">
                            <input type="radio" name="gender" value="female" checked={passengerData.gender === 'female'} onChange={handleChange} className="form-radio text-green-600" />
                            <span className="ml-2">Kadın</span>
                        </label>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adı*</label>
                        <input type="text" name="firstName" value={passengerData.firstName || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50" placeholder="" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Soyadı*</label>
                        <input type="text" name="lastName" value={passengerData.lastName || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50" placeholder="" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi*</label>
                        <div className="flex gap-2">
                            <select
                                name="birthDay"
                                value={passengerData.birthDay || ''}
                                onChange={handleChange}
                                className="w-1/3 p-2 border border-gray-300 rounded-lg bg-gray-50"
                            >
                                <option value="">Gün</option>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                            <select
                                name="birthMonth"
                                value={passengerData.birthMonth || ''}
                                onChange={handleChange}
                                className="w-1/3 p-2 border border-gray-300 rounded-lg bg-gray-50"
                            >
                                <option value="">Ay</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                            <select
                                name="birthYear"
                                value={passengerData.birthYear || ''}
                                onChange={handleChange}
                                className="w-1/3 p-2 border border-gray-300 rounded-lg bg-gray-50"
                            >
                                <option value="">Yıl</option>
                                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 18 - i).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">TC Kimlik No</label>
                        <div className="relative flex items-center">
                            <input 
                                type="text" 
                                name="identityNumber" 
                                value={passengerData.identityNumber || ''} 
                                onChange={handleChange} 
                                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 pr-32"
                                placeholder=""
                                disabled={passengerData.isForeigner}
                            />
                            <div className="absolute right-2 flex items-center">
                                <input 
                                    type="checkbox" 
                                    id={`isForeigner-${passengerNumber}`}
                                    name="isForeigner"
                                    checked={passengerData.isForeigner || false}
                                    onChange={handleChange}
                                    className="h-3.5 w-3.5 rounded text-green-600 focus:ring-green-500 border-gray-300"
                                />
                                <label htmlFor={`isForeigner-${passengerNumber}`} className="ml-1.5 text-xs text-gray-500 select-none">T.C. Vatandaşı Değil</label>
                            </div>
                        </div>
                    </div>
                </div>

                {(!activePassengerId || (activePassengerId && isModified)) && (
                    <div className="border-t pt-4 mt-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={shouldSave} onChange={(e) => onSaveToggle(e.target.checked)} className="h-5 w-5 rounded text-green-600 focus:ring-green-500 border-gray-300"/>
                            {!activePassengerId ? 'Yolcu Listeme Ekle' : 'Yolcu Listemde Güncelle'}
                        </label>
                    </div>
                )}
            </div>

            {flight.selectedBrand && (
                <div className="my-4 p-4 border-l-4 border-green-500 bg-green-50 rounded-lg shadow-sm">
                    <div className="font-bold text-green-800 text-lg mb-1">Seçilen Paket: {flight.selectedBrand.name}</div>
                    <div className="text-sm text-gray-700 mb-1">Bagaj Hakkı: {flight.selectedBrand.baggage || flight.baggage || 'Belirtilmemiş'}</div>
                    {flight.selectedBrand.rules && (
                        <div className="text-xs text-gray-600 mb-1">Kurallar: {flight.selectedBrand.rules}</div>
                    )}
                    {flight.selectedBrand.description && (
                        <div className="text-xs text-gray-500">{flight.selectedBrand.description}</div>
                    )}
                </div>
            )}
        </div>
    );
} 