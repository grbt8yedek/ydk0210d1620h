'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { PassengerFormData } from '@/types/passenger';
import PassengerForm from '@/components/passenger/PassengerForm';
import { logger } from '@/lib/logger';

export default function YolcuDuzenlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passengerId = searchParams.get('id');
  const [isLoading, setIsLoading] = useState(false);
  const [initialFormData, setInitialFormData] = useState<PassengerFormData>({
    firstName: '',
    lastName: '',
    identityNumber: '',
    isForeigner: false,
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    countryCode: '+90',
    phone: '',
    gender: 'male',
    hasMilCard: false,
    hasPassport: false,
    passportNumber: '',
    passportExpiry: '',
    milCardNumber: ''
  });

  useEffect(() => {
    const fetchPassenger = async () => {
      if (!passengerId) return;

      try {
        const response = await fetch(`/api/passengers/${passengerId}`);
        if (!response.ok) {
          throw new Error('Yolcu bilgileri getirilemedi');
        }
        const data = await response.json();
        
        const formData = {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          identityNumber: data.identityNumber || '',
          isForeigner: data.isForeigner || false,
          birthDay: data.birthDay || '',
          birthMonth: data.birthMonth || '',
          birthYear: data.birthYear || '',
          countryCode: data.countryCode || '+90',
          phone: data.phone || '',
          gender: data.gender || 'male',
          hasMilCard: data.hasMilCard || false,
          hasPassport: data.hasPassport || false,
          passportNumber: data.passportNumber || '',
          passportExpiry: data.passportExpiry ? data.passportExpiry.substring(0, 10) : '',
          milCardNumber: data.milCardNumber || ''
        };
        
        setInitialFormData(formData);
      } catch (error) {
        logger.error('Yolcu bilgileri getirme hatası', { error });
        toast.error('Yolcu bilgileri getirilemedi');
      }
    };

    fetchPassenger();
  }, [passengerId]);

  const handleSubmit = async (formData: PassengerFormData) => {
    setIsLoading(true);

    try {
      const url = passengerId 
        ? `/api/passengers/${passengerId}`
        : '/api/passengers';
      
      const method = passengerId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Bir hata oluştu');
      }

      toast.success(passengerId ? 'Yolcu bilgileri güncellendi' : 'Yeni yolcu eklendi');
      router.push('/hesabim/yolcularim');
    } catch (error) {
      // Detaylı error bilgisini logger'a kaydet (güvenli)
      logger.error('Form gönderme hatası', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      
      // Kullanıcıya generic mesaj göster (güvenli)
      toast.error('Bilgiler kaydedilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="sm:container sm:mx-auto sm:px-4 sm:py-8 container mx-auto px-2 py-4">
        <div className="sm:flex sm:gap-8 flex flex-col gap-2">
          
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Link 
                href="/hesabim/yolcularim"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="sm:text-2xl text-lg text-gray-700 font-medium">
                {passengerId ? 'Yolcu Bilgilerini Düzenle' : 'Yeni Yolcu Ekle'}
              </h1>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm sm:p-8 p-2">
              <PassengerForm
                initialData={initialFormData}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 