'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Search } from 'lucide-react';
import { searchAirports } from '@/services/flightApi';
import { Airport } from '@/types/flight';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { logger } from '@/lib/logger';

interface SurveyQuestion {
  id: number;
  question: string;
  type: 'single' | 'multiple' | 'text' | 'rating' | 'searchable' | 'airports' | 'permissions' | 'demographics';
  options?: string[];
  required: boolean;
}

interface SurveyAnswer {
  questionId: number;
  answer: string | string[];
}

export default function SurveyPopup() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null);
  const [returnAirport, setReturnAirport] = useState<Airport | null>(null);
  const [departureSearchTerm, setDepartureSearchTerm] = useState('');
  const [returnSearchTerm, setReturnSearchTerm] = useState('');
  const [departureSuggestions, setDepartureSuggestions] = useState<Airport[]>([]);
  const [returnSuggestions, setReturnSuggestions] = useState<Airport[]>([]);
  const [showDepartureResults, setShowDepartureResults] = useState(false);
  const [showReturnResults, setShowReturnResults] = useState(false);
  const [emailPermission, setEmailPermission] = useState(false);
  const [phonePermission, setPhonePermission] = useState(false);
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('');

  // Türkiye illeri - hem Türkçe hem İngilizce versiyonları ile
  const turkishCities = [
    'ADANA', 'ADIYAMAN', 'AFYONKARAHİSAR', 'AĞRI', 'AMASYA', 'ANKARA', 'ANTALYA', 'ARTVİN', 'AYDIN', 'BALIKESİR',
    'BİLECİK', 'BİNGÖL', 'BİTLİS', 'BOLU', 'BURDUR', 'BURSA', 'ÇANAKKALE', 'ÇANKIRI', 'ÇORUM', 'DENİZLİ',
    'DİYARBAKIR', 'EDİRNE', 'ELAZIĞ', 'ERZİNCAN', 'ERZURUM', 'ESKİŞEHİR', 'GAZİANTEP', 'GİRESUN', 'GÜMÜŞHANE', 'HAKKARİ',
    'HATAY', 'ISPARTA', 'MERSİN', 'İSTANBUL', 'İZMİR', 'KARS', 'KASTAMONU', 'KAYSERİ', 'KIRKLARELİ', 'KIRŞEHİR',
    'KOCAELİ', 'KONYA', 'KÜTAHYA', 'MALATYA', 'MANİSA', 'KAHRAMANMARAŞ', 'MARDİN', 'MUĞLA', 'MUŞ', 'NEVŞEHİR',
    'NİĞDE', 'ORDU', 'RİZE', 'SAKARYA', 'SAMSUN', 'SİİRT', 'SİNOP', 'SİVAS', 'TEKİRDAĞ', 'TOKAT',
    'TRABZON', 'TUNCELİ', 'ŞANLIURFA', 'UŞAK', 'VAN', 'YOZGAT', 'ZONGULDAK', 'AKSARAY', 'BAYBURT', 'KARAMAN',
    'KIRIKKALE', 'BATMAN', 'ŞIRNAK', 'BARTIN', 'ARDAHAN', 'IĞDIR', 'YALOVA', 'KARABÜK', 'KİLİS', 'OSMANİYE', 'DÜZCE',
    // İngilizce klavye versiyonları
    'ISTANBUL', 'IZMIR', 'ISPARTA', 'IGDIR', 'KIRIKKALE', 'KILIS', 'SIVAS',
    'ADANA', 'ADIYAMAN', 'AFYONKARAHISAR', 'AGRI', 'AMASYA', 'ANKARA', 'ANTALYA', 'ARTVIN', 'AYDIN', 'BALIKESIR',
    'BILECIK', 'BINGOL', 'BITLIS', 'BOLU', 'BURDUR', 'BURSA', 'CANAKKALE', 'CANKIRI', 'CORUM', 'DENIZLI',
    'DIYARBAKIR', 'EDIRNE', 'ELAZIG', 'ERZINCAN', 'ERZURUM', 'ESKISEHIR', 'GAZIANTEP', 'GIRESUN', 'GUMUSHANE', 'HAKKARI',
    'HATAY', 'MERSIN', 'KARS', 'KASTAMONU', 'KAYSERI', 'KIRKLARELI', 'KIRSEHIR',
    'KOCAELI', 'KONYA', 'KUTAHYA', 'MALATYA', 'MANISA', 'KAHRAMANMARAS', 'MARDIN', 'MUGLA', 'MUS', 'NEVSEHIR',
    'NIGDE', 'ORDU', 'RIZE', 'SAKARYA', 'SAMSUN', 'SIIRT', 'SINOP', 'TEKIRDAG', 'TOKAT',
    'TRABZON', 'TUNCELI', 'SANLIURFA', 'USAK', 'VAN', 'YOZGAT', 'ZONGULDAK', 'AKSARAY', 'BAYBURT', 'KARAMAN',
    'BATMAN', 'SIRNAK', 'BARTIN', 'ARDAHAN', 'YALOVA', 'KARABUK', 'OSMANIYE', 'DUZCE'
  ];

  // Örnek sorular (siz değiştireceksiniz)
  const questions: SurveyQuestion[] = [
    {
      id: 1,
      question: 'Nerede gurbettesin?',
      type: 'single',
      // Ülkeler büyük harflerle; bayraklar görsel destek için eklendi
      options: [
        '🇩🇪 ALMANYA',
        '🇬🇧 İNGİLTERE',
        '🇫🇷 FRANSA',
        '🇧🇪 BELÇİKA',
        '🇳🇱 HOLLANDA',
        '🇨🇭 İSVİÇRE',
        '🇩🇰 DANİMARKA',
        '🇦🇹 AVUSTURYA',
        '🇸🇪 İSVEÇ',
        'DİĞER',
      ],
      required: true,
    },
    {
      id: 2,
      question: 'Memleketiniz neresi?',
      type: 'searchable',
      options: turkishCities,
      required: true,
    },
    {
      id: 3,
      question: 'En sık kullandığınız havaalanları',
      type: 'airports',
      required: true,
    },
    {
      id: 4,
      question: 'Genelde hangisiyle gidiyorsunuz?',
      type: 'single',
      options: ['Uçakla', 'Arabayla', 'Gemiyle'],
      required: true,
    },
    {
      id: 5,
      question: 'Okula devam eden çocuğunuz var mı?',
      type: 'single',
      options: ['Evet', 'Hayır'],
      required: true,
    },
    {
      id: 6,
      question: 'Türkiye\'de araç kiralıyor musunuz?',
      type: 'single',
      options: ['Evet her zaman', 'Bazen ihtiyaca göre', 'Hayır orada aracım var'],
      required: true,
    },
    {
      id: 7,
      question: 'Tatilde nasıl oteller tercih ediyorsunuz?',
      type: 'single',
      options: ['5 yıldızlı büyük oteller', 'Daha küçük oteller', 'Kiralık villalar'],
      required: true,
    },
    {
      id: 8,
      question: 'Türkiye\'de hangi telefon hattını kullanıyorsunuz?',
      type: 'single',
      options: ['Yurtdışı hattım', 'Türk hattı', 'E-sim'],
      required: true,
    },
    {
      id: 9,
      question: 'Cinsiyetiniz ve yaş aralığınız',
      type: 'demographics',
      required: true,
    },
    {
      id: 10,
      question: 'Teşekkür ederiz!',
      type: 'permissions',
      required: false,
    },
  ];

  // Havaalanı seçimlerinde otomatik ilerleme kontrolü
  useEffect(() => {
    if (questions[currentStep]?.type === 'airports' && departureAirport && returnAirport) {
      const timer = setTimeout(() => {
        handleNext();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [departureAirport, returnAirport, currentStep]);
  // Demographics seçimlerinde otomatik ilerleme kontrolü
  useEffect(() => {
    if (questions[currentStep]?.type === 'demographics' && selectedGender && selectedAgeRange) {
      const timer = setTimeout(() => {
        handleNext();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedGender, selectedAgeRange, currentStep]);
  // Popup'ı giriş yapan kullanıcılara göster
  useEffect(() => {
    const checkAndShowSurvey = async () => {
      // Giriş yapmış kullanıcılar için
      if (session?.user?.id) {
        try {
          // Kullanıcının daha önce anket doldurup doldurmadığını kontrol et
          const response = await fetch(`/api/survey?userId=${session.user.id}`);
          const data = await response.json();
          
          logger.debug('Anket kontrolü', {
            userId: session.user.id,
            apiResponse: data,
            pathname: pathname,
            isAccountPage: pathname === '/account' || pathname === '/hesabim'
          });
          
          if (data.success && data.data.length === 0) {
            // Anket doldurmamış
            const hasCompleted = localStorage.getItem(`surveyCompleted_${session.user.id}`);
            const sessionKey = `surveyShown_${session.user.id}_${new Date().toDateString()}`;
            const hasShownToday = localStorage.getItem(sessionKey);
            
            logger.debug('LocalStorage kontrolü', {
              hasCompleted,
              hasShownToday,
              sessionKey
            });
            
            // Strateji: Ana sayfa ve hesabım sayfasında göster
            const isAccountPage = pathname === '/account' || pathname === '/hesabim';
            const isHomePage = pathname === '/';
            
            // Ana sayfa veya hesabım sayfasında ve bugün gösterilmemişse göster
            if ((isHomePage || isAccountPage) && !hasCompleted && !hasShownToday) {
              logger.debug('Anket popup gösteriliyor');
              setIsOpen(true);
              localStorage.setItem(sessionKey, 'true');
            }
          }
        } catch (error) {
          logger.error('Anket durumu kontrol hatası', { error });
        }
      } else {
        // Giriş yapmamış kullanıcılar için - yeni kullanıcılar
        const isHomePage = pathname === '/';
        const hasShownToGuest = localStorage.getItem('surveyShown_guest_today');
        
        if (isHomePage && !hasShownToGuest) {
          logger.debug('Misafir kullanıcıya anket gösteriliyor');
          setIsOpen(true);
          localStorage.setItem('surveyShown_guest_today', 'true');
        }
      }
    };

    checkAndShowSurvey();
  }, [session, pathname]);

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      // Cevabı kaydet
      if (questions[currentStep].type === 'airports') {
        // Havaalanı seçimleri için özel kaydetme
        if (departureAirport && returnAirport) {
          const newAnswer: SurveyAnswer = {
            questionId: questions[currentStep].id,
            answer: JSON.stringify({
              departure: departureAirport,
              return: returnAirport
            }),
          };
          setAnswers([...answers, newAnswer]);
        }
      } else if (currentAnswer && (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : (currentAnswer as string).trim() !== '')) {
        const newAnswer: SurveyAnswer = {
          questionId: questions[currentStep].id,
          answer: currentAnswer,
        };
        setAnswers([...answers, newAnswer]);
      }

      setCurrentStep(currentStep + 1);
      setCurrentAnswer([]);
      setSearchTerm('');
      setShowSearchResults(false);
      // Havaalanı state'lerini temizle
      setDepartureAirport(null);
      setReturnAirport(null);
      setDepartureSearchTerm('');
      setReturnSearchTerm('');
      setShowDepartureResults(false);
      setShowReturnResults(false);
      // Demographics state'lerini temizle
      setSelectedGender('');
      setSelectedAgeRange('');
    } else {
      // Son soru - anketi tamamla
      if (questions[currentStep].type === 'airports') {
        if (departureAirport && returnAirport) {
          const newAnswer: SurveyAnswer = {
            questionId: questions[currentStep].id,
            answer: JSON.stringify({
              departure: departureAirport,
              return: returnAirport
            }),
          };
          setAnswers([...answers, newAnswer]);
        }
      } else if (currentAnswer && (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : (currentAnswer as string).trim() !== '')) {
        const newAnswer: SurveyAnswer = {
          questionId: questions[currentStep].id,
          answer: currentAnswer,
        };
        setAnswers([...answers, newAnswer]);
      }
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Önceki cevabı geri yükle
      const prevAnswer = answers.find((a) => a.questionId === questions[currentStep - 1].id);
      setCurrentAnswer(prevAnswer?.answer || []);
      setSearchTerm('');
      setShowSearchResults(false);
    }
  };

  const handleAnswerChange = (answer: string) => {
    if (questions[currentStep].type === 'multiple') {
      const currentAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
      let newAnswers;
      if (currentAnswers.includes(answer)) {
        newAnswers = currentAnswers.filter((a) => a !== answer);
      } else {
        newAnswers = [...currentAnswers, answer];
      }
      setCurrentAnswer(newAnswers);
      
      // Multiple choice cevabını hemen kaydet
      const newAnswer: SurveyAnswer = {
        questionId: questions[currentStep].id,
        answer: newAnswers,
      };
      setAnswers(prevAnswers => {
        const existingIndex = prevAnswers.findIndex(a => a.questionId === questions[currentStep].id);
        if (existingIndex >= 0) {
          const updatedAnswers = [...prevAnswers];
          updatedAnswers[existingIndex] = newAnswer;
          return updatedAnswers;
        } else {
          return [...prevAnswers, newAnswer];
        }
      });
    } else {
      setCurrentAnswer(answer);
      if (questions[currentStep].type === 'searchable') {
        setShowSearchResults(false);
      }
      
      // Cevabı hemen kaydet
      const newAnswer: SurveyAnswer = {
        questionId: questions[currentStep].id,
        answer: answer,
      };
      setAnswers(prevAnswers => {
        // Aynı soru ID'si varsa güncelle, yoksa ekle
        const existingIndex = prevAnswers.findIndex(a => a.questionId === questions[currentStep].id);
        if (existingIndex >= 0) {
          const updatedAnswers = [...prevAnswers];
          updatedAnswers[existingIndex] = newAnswer;
          return updatedAnswers;
        } else {
          return [...prevAnswers, newAnswer];
        }
      });
      
      // Searchable sorularda otomatik ilerleme
      if (questions[currentStep].type === 'searchable' && currentAnswer) {
        setTimeout(() => {
          handleNext();
        }, 500); // 500ms bekle, sonra otomatik geç
      }
      
      // Single seçim sorularında otomatik ilerleme
      if (questions[currentStep].type === 'single' && questions[currentStep].required) {
        setTimeout(() => {
          handleNext();
        }, 500); // 500ms bekle, sonra otomatik geç
      }
      
      // Demographics seçimlerinde otomatik ilerleme
      if (questions[currentStep].type === 'demographics' && selectedGender && selectedAgeRange) {
        setTimeout(() => {
          handleNext();
        }, 500); // 500ms bekle, sonra otomatik geç
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (session?.user?.id) {
      // Popup'ı kapatırken bugün için gösterilmiş olarak işaretle
      const sessionKey = `surveyShown_${session.user.id}_${new Date().toDateString()}`;
      localStorage.setItem(sessionKey, 'true');
    } else {
      // Giriş yapmamış kullanıcılar için
      localStorage.setItem('surveyShown_guest_today', 'true');
    }
  };

  const searchAirportsForSurvey = async (query: string, setSuggestions: React.Dispatch<React.SetStateAction<Airport[]>>) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const results = await searchAirports(query);
      setSuggestions(results.slice(0, 8)); // Maksimum 8 sonuç
    } catch (error) {
      logger.error('Havalimanı arama hatası', { error });
      setSuggestions([]);
    }
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) return; // Giriş yapmamış kullanıcılar için çık
    
    try {
      // İzinleri de ekle
      const finalAnswers = [...answers];
      if (emailPermission || phonePermission) {
        finalAnswers.push({
          questionId: 10,
          answer: JSON.stringify({
            emailPermission,
            phonePermission
          }),
        });
      }

      // Anket sonuçlarını API'ye gönder
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          answers: finalAnswers,
          completedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        localStorage.setItem(`surveyCompleted_${session.user.id}`, 'true');
        setIsOpen(false);
      } else {
        // API hatası olsa bile popup'ı kapat
        localStorage.setItem(`surveyCompleted_${session.user.id}`, 'true');
        setIsOpen(false);
      }
    } catch (error) {
      logger.error('Anket gönderilirken hata', { error });
      // Hata olsa bile popup'ı kapat
      localStorage.setItem(`surveyCompleted_${session.user.id}`, 'true');
      setIsOpen(false);
    }
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  // Arama sonuçlarını filtrele
  const filteredCities = currentQuestion.type === 'searchable' && currentQuestion.options
    ? currentQuestion.options.filter(city => 
        city.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8) // Maksimum 8 sonuç göster
    : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto">
        {/* Header - Kaldırıldı */}

        {/* Content */}
        <div className="p-6">
          {!isCompleted ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 text-center flex-1">
                  {currentQuestion.question}
                  {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                </h2>
                <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors ml-4">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Question Content */}
              <div className="space-y-3">
                {/* İlk soru için: buton grid görünümü */}
                {currentQuestion.id === 1 && currentQuestion.options && (
                  <div className="grid grid-cols-2 gap-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = currentAnswer === option;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAnswerChange(option)}
                          className={`flex items-center justify-between px-4 py-3 border rounded-lg transition-colors text-left ${
                            isSelected ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <span className="font-medium text-gray-800">{option}</span>
                          {isSelected && <Check className="w-5 h-5 text-green-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Havaalanı seçimi için */}
                {currentQuestion.type === 'airports' && (
                  <div className="space-y-4">
                    {/* Gidiş havaalanı */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gidiş havaalanı
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={departureSearchTerm}
                          onChange={(e) => {
                            setDepartureSearchTerm(e.target.value);
                            searchAirportsForSurvey(e.target.value, setDepartureSuggestions);
                            setShowDepartureResults(true);
                          }}
                          onFocus={() => setShowDepartureResults(true)}
                          placeholder="Havaalanı adı veya kodu yazın..."
                          className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                      
                      {/* Seçilen gidiş havaalanı gösterimi */}
                      {departureAirport && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-green-800 font-medium">
                              {departureAirport.name} ({departureAirport.code})
                            </span>
                            <button
                              onClick={() => {
                                setDepartureAirport(null);
                                setDepartureSearchTerm('');
                              }}
                              className="text-green-600 hover:text-green-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Gidiş havaalanı arama sonuçları */}
                      {showDepartureResults && departureSearchTerm && departureSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {departureSuggestions.map((airport, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setDepartureAirport(airport);
                                setDepartureSearchTerm(airport.name + ' (' + airport.code + ')');
                                setShowDepartureResults(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="font-medium">{airport.name}</div>
                              <div className="text-sm text-gray-500">{airport.code} - {airport.city}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dönüş havaalanı */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dönüş havaalanı
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={returnSearchTerm}
                          onChange={(e) => {
                            setReturnSearchTerm(e.target.value);
                            searchAirportsForSurvey(e.target.value, setReturnSuggestions);
                            setShowReturnResults(true);
                          }}
                          onFocus={() => setShowReturnResults(true)}
                          placeholder="Havaalanı adı veya kodu yazın..."
                          className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                      
                      {/* Seçilen dönüş havaalanı gösterimi */}
                      {returnAirport && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-green-800 font-medium">
                              {returnAirport.name} ({returnAirport.code})
                            </span>
                            <button
                              onClick={() => {
                                setReturnAirport(null);
                                setReturnSearchTerm('');
                              }}
                              className="text-green-600 hover:text-green-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Dönüş havaalanı arama sonuçları */}
                      {showReturnResults && returnSearchTerm && returnSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {returnSuggestions.map((airport, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setReturnAirport(airport);
                                setReturnSearchTerm(airport.name + ' (' + airport.code + ')');
                                setShowReturnResults(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="font-medium">{airport.name}</div>
                              <div className="text-sm text-gray-500">{airport.code} - {airport.city}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Arama yapılabilir soru için */}
                {currentQuestion.type === 'searchable' && (
                  <div className="relative">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowSearchResults(true);
                        }}
                        onFocus={() => setShowSearchResults(true)}
                        placeholder="Şehir adı yazın..."
                        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    
                    {/* Seçilen şehir gösterimi */}
                    {currentAnswer && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-green-800 font-medium">{currentAnswer}</span>
                          <button
                            onClick={() => {
                              setCurrentAnswer('');
                              setSearchTerm('');
                            }}
                            className="text-green-600 hover:text-green-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Arama sonuçları */}
                    {showSearchResults && searchTerm && filteredCities.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {filteredCities.map((city, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              handleAnswerChange(city);
                              setSearchTerm(city);
                              setShowSearchResults(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Demographics ekranı için */}
                {currentQuestion.type === 'demographics' && (
                  <div className="space-y-6">
                    {/* Cinsiyet seçimi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Cinsiyetiniz
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="gender"
                            value="Kadın"
                            checked={selectedGender === 'Kadın'}
                            onChange={(e) => {
                              setSelectedGender(e.target.value);
                              // Demographics cevabını güncelle
                              const demographicsAnswer = {
                                gender: e.target.value,
                                ageRange: selectedAgeRange
                              };
                              const newAnswer: SurveyAnswer = {
                                questionId: questions[currentStep].id,
                                answer: JSON.stringify(demographicsAnswer),
                              };
                              setAnswers(prevAnswers => {
                                const existingIndex = prevAnswers.findIndex(a => a.questionId === questions[currentStep].id);
                                if (existingIndex >= 0) {
                                  const updatedAnswers = [...prevAnswers];
                                  updatedAnswers[existingIndex] = newAnswer;
                                  return updatedAnswers;
                                } else {
                                  return [...prevAnswers, newAnswer];
                                }
                              });
                            }}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="text-gray-700">Kadın</span>
                        </label>
                        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="gender"
                            value="Erkek"
                            checked={selectedGender === 'Erkek'}
                            onChange={(e) => {
                              setSelectedGender(e.target.value);
                              // Demographics cevabını güncelle
                              const demographicsAnswer = {
                                gender: e.target.value,
                                ageRange: selectedAgeRange
                              };
                              const newAnswer: SurveyAnswer = {
                                questionId: questions[currentStep].id,
                                answer: JSON.stringify(demographicsAnswer),
                              };
                              setAnswers(prevAnswers => {
                                const existingIndex = prevAnswers.findIndex(a => a.questionId === questions[currentStep].id);
                                if (existingIndex >= 0) {
                                  const updatedAnswers = [...prevAnswers];
                                  updatedAnswers[existingIndex] = newAnswer;
                                  return updatedAnswers;
                                } else {
                                  return [...prevAnswers, newAnswer];
                                }
                              });
                            }}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="text-gray-700">Erkek</span>
                        </label>
                      </div>
                    </div>

                    {/* Yaş aralığı seçimi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Yaş aralığınız
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map((ageRange) => (
                          <label
                            key={ageRange}
                            className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="radio"
                              name="ageRange"
                              value={ageRange}
                              checked={selectedAgeRange === ageRange}
                              onChange={(e) => {
                                setSelectedAgeRange(e.target.value);
                                // Demographics cevabını güncelle
                                const demographicsAnswer = {
                                  gender: selectedGender,
                                  ageRange: e.target.value
                                };
                                const newAnswer: SurveyAnswer = {
                                  questionId: questions[currentStep].id,
                                  answer: JSON.stringify(demographicsAnswer),
                                };
                                setAnswers(prevAnswers => {
                                  const existingIndex = prevAnswers.findIndex(a => a.questionId === questions[currentStep].id);
                                  if (existingIndex >= 0) {
                                    const updatedAnswers = [...prevAnswers];
                                    updatedAnswers[existingIndex] = newAnswer;
                                    return updatedAnswers;
                                  } else {
                                    return [...prevAnswers, newAnswer];
                                  }
                                });
                              }}
                              className="text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">{ageRange}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* İzinler ekranı için */}
                {currentQuestion.type === 'permissions' && (
                  <div className="text-center space-y-6">
                    <div className="flex items-center justify-end mb-6">
                      <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Sana uygun fırsatlardan haberdar olmak için lütfen e-posta ve telefon bildirimlerine izin ver. 
                      Merak etme, seni sürekli rahatsız etmeyeceğiz.
                    </p>

                    <div className="space-y-4">
                      {/* E-posta izni */}
                      <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={emailPermission}
                          onChange={(e) => setEmailPermission(e.target.checked)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <div className="text-left">
                          <span className="font-medium text-gray-700">E-posta bildirimlerine izin ver</span>
                          <p className="text-sm text-gray-500">En iyi fırsatları e-posta ile al</p>
                        </div>
                      </label>

                      {/* Telefon izni */}
                      <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={phonePermission}
                          onChange={(e) => setPhonePermission(e.target.checked)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <div className="text-left">
                          <span className="font-medium text-gray-700">Telefon bildirimlerine izin ver</span>
                          <p className="text-sm text-gray-500">Acil fırsatları SMS ile al</p>
                        </div>
                      </label>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={handleSubmit}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Kapat
                      </button>
                    </div>
                  </div>
                )}

                {/* Diğer single tipler için standart liste */}
                {currentQuestion.type === 'single' && currentQuestion.id !== 1 && currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <label
                        key={index}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={currentAnswer === option}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'multiple' && currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <label
                        key={index}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          value={option}
                          checked={Array.isArray(currentAnswer) && currentAnswer.includes(option)}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'text' && (
                  <textarea
                    value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Cevabınızı buraya yazın..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                )}

                {currentQuestion.type === 'rating' && (
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleAnswerChange(rating.toString())}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${
                          currentAnswer === rating.toString()
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 text-gray-400 hover:border-green-300'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation */}
              {currentQuestion.type !== 'permissions' && (
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Önceki</span>
                  </button>

                  <span className="text-sm text-gray-500">{currentStep + 1} / 10</span>

                  <button
                    onClick={handleNext}
                    disabled={
                      currentQuestion.required &&
                      (currentQuestion.type === 'airports' 
                        ? (!departureAirport || !returnAirport)
                        : currentQuestion.type === 'demographics'
                        ? (!selectedGender || !selectedAgeRange)
                        : Array.isArray(currentAnswer) ? currentAnswer.length === 0 : !currentAnswer || currentAnswer.toString().trim() === ''
                      )
                    }
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>{currentStep === questions.length - 1 ? 'Tamamla' : 'Sonraki'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Completion Screen */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Anketi Tamamladınız!</h2>
              <p className="text-gray-600 mb-6">
                Değerli görüşleriniz için teşekkür ederiz. Bu bilgiler bize daha iyi hizmet vermemize yardımcı olacak.
              </p>
              <button onClick={handleSubmit} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Gönder ve Kapat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
