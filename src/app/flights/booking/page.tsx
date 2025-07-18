'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Mail } from 'lucide-react';
import { useSession } from 'next-auth/react';
import LoginModal from '@/components/LoginModal';
import { useRouter } from 'next/navigation';
import { addExtraBaggageBiletDukkaniDemo, createOrderBiletDukkaniDemo } from '@/services/flightApi';

// Import booking components
import FlightDetailsCard from '@/components/booking/FlightDetailsCard';
import ContactForm from '@/components/booking/ContactForm';
import PassengerList from '@/components/booking/PassengerList';
import BaggageSelection from '@/components/booking/BaggageSelection';
import PriceSummary from '@/components/booking/PriceSummary';
import ReservationModal from '@/components/booking/ReservationModal';





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
           setBaggageSelections(Array(total).fill(null).map(() => [{ weight: 20, label: '20 kg Bagaj (Standart)', price: 0 }])); // Default baggage for 1 leg
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

                        <PassengerList 
                            passengers={passengers}
                            passengerDetails={passengerDetails}
                            savedPassengers={savedPassengers}
                            flight={flight}
                            onSelectSavedPassenger={handleSelectSavedPassenger}
                            onPassengerFormChange={handlePassengerFormChange}
                            onSaveToggle={handleSaveToggle}
                        />

                        <BaggageSelection 
                            passengers={passengerDetails} 
                            flight={flight} 
                            onBaggageChange={handleBaggageChange}
                            baggageSelections={baggageSelections}
                        />
                    </div>

                    {/* Right Column: Price Summary */}
                    <div className="lg:col-span-1">
                        <PriceSummary 
                            totalPassengers={totalPassengers}
                            baseTotalPrice={baseTotalPrice}
                            totalBaggagePrice={totalBaggagePrice}
                            taxes={taxes}
                            finalTotalPrice={finalTotalPrice}
                            termsAccepted={termsAccepted}
                            bookingType={bookingType}
                            onTermsChange={setTermsAccepted}
                            onBookingTypeChange={setBookingType}
                            onProceedToPayment={handleProceedToPayment}
                        />
                    </div>
                </div>
                <ReservationModal 
                    isOpen={reservationModalOpen}
                    reservationInfo={reservationInfo}
                    onClose={() => setReservationModalOpen(false)}
                />
            </main>
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </>
    );
} 