'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { PlaneTakeoff, PlaneLanding, User, Mail, Phone, Shield, Briefcase, Lock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import LoginModal from '@/components/LoginModal';
import { useRouter } from 'next/navigation';
import { addExtraBaggageBiletDukkaniDemo, createOrderBiletDukkaniDemo } from '@/services/flightApi';

const BAGGAGE_OPTIONS = [
    { weight: 0, label: 'Sadece Kabin Bagajı', price: -10 }, // Fiyattan düşülebilir
    { weight: 20, label: '20 kg Bagaj (Standart)', price: 0 },
    { weight: 25, label: '25 kg Bagaj', price: 15 },
    { weight: 30, label: '30 kg Bagaj', price: 25 },
];

const FlightDetailsCard = ({ flight }: { flight: any }) => {
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
};

const PassengerForm = ({ 
    passengerNumber, 
    passengerType,
    savedPassengers,
    onSelectPassenger,
    onFormChange,
    passengerData,
    onSaveToggle,
    shouldSave,
    flight
}: { 
    passengerNumber: number;
    passengerType: 'Yetişkin' | 'Çocuk';
    savedPassengers: any[];
    onSelectPassenger: (passenger: any | null) => void;
    onFormChange: (field: string, value: any) => void;
    passengerData: any;
    onSaveToggle: (checked: boolean) => void;
    shouldSave: boolean;
    flight: any;
}) => {
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
                        {savedPassengers.map(p => (
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
};

const ContactForm = ({ 
    userEmail,
    userPhone,
    onEmailChange,
    onPhoneChange,
    onCountryCodeChange
}: { 
    userEmail?: string | null;
    userPhone?: string | null;
    onEmailChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onCountryCodeChange: (value: string) => void;
}) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-posta adresiniz</label>
                    <input type="email" 
                           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                           placeholder="ornek@eposta.com"
                           value={userEmail || ''}
                           onChange={(e) => onEmailChange(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cep Telefonunuz</label>
                    <div className="flex">
                        <select 
                            onChange={(e) => onCountryCodeChange(e.target.value)}
                            className="p-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 focus:ring-1 focus:ring-green-500 focus:border-green-500 appearance-none"
                        >
                            <option value="+90">🇹🇷 +90</option>
                            <option value="+49">🇩🇪 +49</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+33">🇫🇷 +33</option>
                            <option value="+32">🇧🇪 +32</option>
                            <option value="+31">🇳🇱 +31</option>
                            <option value="+41">🇨🇭 +41</option>
                            <option value="+45">🇩🇰 +45</option>
                        </select>
                        <input 
                            type="tel" 
                            className="w-full p-3 border border-gray-300 rounded-r-lg focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                            placeholder="5XX XXX XX XX" 
                            value={userPhone || ''}
                            onChange={(e) => onPhoneChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <p className="text-sm text-gray-500 pt-2 border-t mt-4 pt-4">
                Uçuş ve bilet bilgilerinizi e-posta ve ücretsiz SMS yoluyla ileteceğiz.
            </p>
            <div className="border-t pt-4 mt-2">
                <div className="flex items-start gap-3">
                    <input type="checkbox" id="marketing-consent" className="h-5 w-5 rounded text-green-600 focus:ring-green-500 border-gray-300 mt-1 flex-shrink-0" />
                    <label htmlFor="marketing-consent" className="text-sm text-gray-700">
                        Uçuş bilgilendirmeleri, fırsat ve kampanyalardan <a href="#" className="font-bold text-gray-800 hover:underline">Rıza Metni</a> kapsamında haberdar olmak istiyorum.
                    </label>
                </div>
                {/* Ücretsiz SMS etiketi kaldırıldı */}
            </div>
        </div>
    )
}

const BaggageSelection = ({ passengers, flight, onBaggageChange, baggageSelections }: { passengers: any[], flight: any, onBaggageChange: (passengerIndex: number, legIndex: number, baggage: any) => void, baggageSelections: any[] }) => {
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
                             <div key={`leg-${lIndex}`} className={`p-4 border rounded-lg ${typeof window !== 'undefined' && window.innerWidth < 768 ? 'flex flex-col gap-2 items-start' : 'flex items-center justify-between gap-4'}`}>
                                <div className="flex-1 w-full">
                                    <p className="font-bold text-gray-800">{`${pIndex + 1}. ${passenger.type || 'Yolcu'}`}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <PlaneTakeoff size={16} className="text-orange-500"/>
                                        <p className="text-sm font-semibold">{leg.type} ({leg.flight.origin}-{leg.flight.destination})</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Bagaj hakkı 1x{leg.flight.baggage || '20kg'}</p>
                                </div>
                                <div className="w-48 sm:w-full mt-2 sm:mt-0">
                                     <label className="block text-xs text-gray-500 mb-1">Ek check-in bagajı</label>
                                     <select
                                        className={`w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-sm ${typeof window !== 'undefined' && window.innerWidth < 768 ? 'mt-1' : ''}`}
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
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

const initialPassengerState = {
    id: null,
    firstName: '',
    lastName: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    gender: '',
    identityNumber: '',
    isForeigner: false,
    shouldSave: false
};

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

export default function BookingPage() {
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [flight, setFlight] = useState<any>(null);
    const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
    const [savedPassengers, setSavedPassengers] = useState<any[]>([]);
    const [passengerDetails, setPassengerDetails] = useState<PassengerDetail[]>([]);
    const [baggageSelections, setBaggageSelections] = useState<any[]>([]);
    const [totalBaggagePrice, setTotalBaggagePrice] = useState(0);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+90');
    const [marketingConsent, setMarketingConsent] = useState(false);
    const [bookingType, setBookingType] = useState<'reserve' | 'book'>('book');
    const [reservationModalOpen, setReservationModalOpen] = useState(false);
    const [reservationInfo, setReservationInfo] = useState<any>(null);

    useEffect(() => {
        const fetchSavedPassengers = async () => {
            try {
                const response = await fetch('/api/passengers');
                if (response.ok) {
                    const data = await response.json();
                    setSavedPassengers(data);
                } else {
                    console.log('Could not fetch saved passengers, user might not be logged in.');
                }
            } catch (error) {
                console.error('Error fetching saved passengers:', error);
            }
        };

        fetchSavedPassengers();
        
        const flightData = searchParams.get('flight');
        const adults = parseInt(searchParams.get('adults') || '1', 10);
        const children = parseInt(searchParams.get('children') || '0', 10);
        const infants = parseInt(searchParams.get('infants') || '0', 10);
        
        setPassengers({ adults, children, infants });
        const total = adults + children;
        if (passengerDetails.length !== total) {
           setPassengerDetails(Array(total).fill(null).map((_, i) => ({ 
               ...initialPassengerState,
               type: i < adults ? 'Yetişkin' : 'Çocuk' 
            })));
           setBaggageSelections(Array(total).fill(null).map(() => [{ ...BAGGAGE_OPTIONS[1] }])); // Default baggage for 1 leg
        }

        if (flightData) {
            try {
                const decodedFlight = decodeURIComponent(flightData);
                setFlight(JSON.parse(decodedFlight));
            } catch (error) {
                console.error("Failed to parse flight data", error);
            }
        }

        if (session?.user) {
            if (session.user.email) {
                setContactEmail(session.user.email);
            }
            if (session.user.phone) {
                setContactPhone(session.user.phone);
            }
        }
    }, [searchParams, passengerDetails.length, session]);
    
    const handlePassengerFormChange = (passengerIndex: number, field: string, value: any) => {
        const newDetails = [...passengerDetails];
        newDetails[passengerIndex] = { ...newDetails[passengerIndex], [field]: value };
        setPassengerDetails(newDetails);
    };

    const handleSelectSavedPassenger = (passengerIndex: number, passengerData: any | null) => {
        const newDetails = [...passengerDetails];
        if (passengerData) {
            newDetails[passengerIndex] = { ...passengerData, shouldSave: false, type: newDetails[passengerIndex].type };
        } else {
            newDetails[passengerIndex] = { ...initialPassengerState, type: newDetails[passengerIndex].type };
        }
        setPassengerDetails(newDetails);
    };

    const handleSaveToggle = (passengerIndex: number, checked: boolean) => {
        const newDetails = [...passengerDetails];
        newDetails[passengerIndex].shouldSave = checked;
        setPassengerDetails(newDetails);
    };
    
    const handleBaggageChange = async (passengerIndex: number, legIndex: number, baggage: any) => {
        const newSelections = [...baggageSelections];
        if (!newSelections[passengerIndex]) newSelections[passengerIndex] = [];
        newSelections[passengerIndex][legIndex] = baggage;
        setBaggageSelections(newSelections);

        // Recalculate total baggage price
        const total = newSelections.flat().reduce((acc, val) => acc + (val?.price || 0), 0);
        setTotalBaggagePrice(total);

        // Demo: Ekstra bagaj API çağrısı
        if (baggage && baggage.weight > (flight.baggage ? parseInt(flight.baggage) : 20)) {
            // Demo sabitleriyle örnek çağrı
            const result = await addExtraBaggageBiletDukkaniDemo({
                fareExtraBaggages: [
                    {
                        fareId: 'demo-fare-id-12345',
                        flightId: flight.id?.toString() || 'demo-flight-id',
                        extraBaggageId: 'demo-baggage-id-1',
                        passengerIndex,
                        passengerType: passengerDetails[passengerIndex]?.type === 'Çocuk' ? 'child' : 'adult'
                    }
                ]
            });
            console.log('DEMO Ekstra Bagaj API sonucu:', result);
        }
    };

    const handleProceedToPayment = async () => {
        if (!termsAccepted) {
            alert('Devam etmek için lütfen kullanım koşullarını kabul edin.');
            return;
        }

        // Yolcu bilgilerini kaydet/güncelle
        const promises = passengerDetails.map(p => {
            if (!p.shouldSave) return Promise.resolve();
            
            const payload = {
                firstName: p.firstName,
                lastName: p.lastName,
                birthDay: p.birthDay,
                birthMonth: p.birthMonth,
                birthYear: p.birthYear,
                gender: p.gender,
                identityNumber: p.identityNumber,
                isForeigner: p.isForeigner || false,
            };

            if (p.id) { // Update existing passenger
                return fetch(`/api/passengers/${p.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else { // Create new passenger
                return fetch('/api/passengers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
        });

        try {
            const results = await Promise.all(promises);
            console.log("Save/Update results:", results);
            
            // BiletDukkani POST /orders demo çağrısı
            try {
                const orderResult = await createOrderBiletDukkaniDemo({
                    fareIds: ['demo-fare-id-12345'], // Demo fare ID
                    passengers: passengerDetails.map((p, idx) => ({
                        firstName: p.firstName,
                        lastName: p.lastName,
                        birthDay: p.birthDay,
                        birthMonth: p.birthMonth,
                        birthYear: p.birthYear,
                        gender: p.gender,
                        identityNumber: p.identityNumber,
                        isForeigner: p.isForeigner || false,
                        passengerType: idx === 0 ? 'Yetişkin' : 'Yetişkin' // İlk yolcu yetişkin, diğerleri de yetişkin (demo)
                    })),
                    contactInfo: {
                        firstName: session?.user?.firstName || passengerDetails[0]?.firstName || '',
                        lastName: session?.user?.lastName || passengerDetails[0]?.lastName || '',
                        email: contactEmail,
                        phone: contactPhone
                    },
                    marketingConsent: marketingConsent,
                    bookingType: bookingType,
                    orderType: 'individual',
                });
                
                if (bookingType === 'reserve') {
                    setReservationInfo({
                        pnr: orderResult.pnr,
                        validUntil: orderResult.orderDetails?.validUntil || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                        totalPrice: orderResult.orderDetails?.totalPrice || 50,
                        currency: orderResult.orderDetails?.currency || 'TRY',
                    });
                    setReservationModalOpen(true);
                } else {
                    alert(`Biletleme başarıyla tamamlandı! PNR: ${orderResult.pnr}`);
                }
            } catch (orderError) {
                console.error("Sipariş oluşturma hatası:", orderError);
                alert('Sipariş oluşturulurken bir hata oluştu.');
            }
            
            alert('Yolcu bilgileri başarıyla kaydedildi/güncellendi!');
            // TODO: Navigate to the actual payment page
        } catch (error) {
            console.error('Failed to save/update passenger details', error);
            alert('Yolcu bilgilerini kaydederken bir hata oluştu.');
        }
    };

    if (!flight || passengerDetails.length === 0) {
        return (
            <div>
                <Header />
                <main className="container mx-auto px-4 py-8 text-center">
                    <p>Uçuş bilgileri yükleniyor veya bulunamadı...</p>
                </main>
            </div>
        );
    }

    const totalPassengers = passengers.adults + passengers.children;
    const baseTotalPrice = flight.price * totalPassengers;
    const taxes = baseTotalPrice * 0.1;
    const finalTotalPrice = baseTotalPrice + taxes + totalBaggagePrice;

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-100 py-8">
                <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        <FlightDetailsCard flight={flight} />
                        
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Mail /> İletişim Bilgileri
                                </h2>
                                {status !== 'authenticated' && (
                                    <p className="text-sm text-gray-600">
                                        Hızlı rezervasyon için{' '}
                                        <button onClick={() => setShowLoginModal(true)} className="text-green-600 font-semibold underline hover:text-green-700 transition">
                                            giriş yap
                                        </button>
                                    </p>
                                )}
                            </div>
                            <ContactForm 
                                userEmail={contactEmail}
                                userPhone={contactPhone}
                                onEmailChange={setContactEmail}
                                onPhoneChange={setContactPhone}
                                onCountryCodeChange={setCountryCode}
                            />
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><User /> Yolcu Bilgileri</h2>
                            {Array.from({ length: passengers.adults }).map((_, index) => (
                                <PassengerForm 
                                    key={`adult-${index}`} 
                                    passengerNumber={index + 1} 
                                    passengerType="Yetişkin"
                                    savedPassengers={savedPassengers.filter(p => 
                                        !passengerDetails.some(pd => pd.id === p.id && passengerDetails[index]?.id !== p.id)
                                    )}
                                    onSelectPassenger={(p) => handleSelectSavedPassenger(index, p)}
                                    onFormChange={(field, value) => handlePassengerFormChange(index, field, value)}
                                    passengerData={passengerDetails[index]}
                                    onSaveToggle={(checked) => handleSaveToggle(index, checked)}
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
                                    onSelectPassenger={(p) => handleSelectSavedPassenger(passengerIndex, p)}
                                    onFormChange={(field, value) => handlePassengerFormChange(passengerIndex, field, value)}
                                    passengerData={passengerDetails[passengerIndex]}
                                    onSaveToggle={(checked) => handleSaveToggle(passengerIndex, checked)}
                                    shouldSave={passengerDetails[passengerIndex]?.shouldSave}
                                    flight={flight}
                                />
                            )})}
                        </div>

                        <BaggageSelection 
                            passengers={passengerDetails} 
                            flight={flight} 
                            onBaggageChange={handleBaggageChange}
                            baggageSelections={baggageSelections}
                        />
                    </div>

                    {/* Right Column: Price Summary */}
                    <div className="lg:col-span-1">
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
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
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
                                            onChange={() => setBookingType('reserve')}
                                        />
                                        <span className="ml-1">Rezervasyon Yap</span>
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="bookingType"
                                            value="book"
                                            checked={bookingType === 'book'}
                                            onChange={() => setBookingType('book')}
                                        />
                                        <span className="ml-1">Bileti Al</span>
                                    </label>
                                </div>
                            </div>

                            <button 
                                onClick={handleProceedToPayment} 
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
                    </div>
                </div>
                {/* Rezervasyon Modalı */}
                {reservationModalOpen && reservationInfo && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200">
                            <h3 className="text-2xl font-extrabold mb-6 text-green-700 text-center tracking-tight">Rezervasyon Başarılı!</h3>
                            <div className="mb-4 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-medium text-gray-700">PNR:</span>
                                    <span className="font-mono text-lg font-semibold text-gray-900">{reservationInfo.pnr}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-medium text-gray-700">Rezervasyon Geçerlilik Süresi:</span>
                                    <span className="font-mono text-lg font-semibold text-gray-900">{new Date(reservationInfo.validUntil).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-medium text-gray-700">Rezervasyon Ücreti:</span>
                                    <span className="font-mono text-lg font-semibold text-gray-900">{reservationInfo.totalPrice} {reservationInfo.currency}</span>
                                </div>
                            </div>
                            <button
                                className="mt-8 w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition text-lg shadow-sm"
                                onClick={() => setReservationModalOpen(false)}
                            >
                                Tamam
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </>
    );
} 