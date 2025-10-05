'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Building2, Home, Plus, Trash2, Edit, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface BillingInfo {
  id: string;
  type: 'individual' | 'corporate';
  title: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  taxOffice?: string;
  taxNumber?: string;
  address: string;
  district?: string;
  city: string;
  country: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FaturaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Ülke listesi (telefon kodları ile)
  const countries = [
    { code: 'TR', name: 'Türkiye', phone: '+90' },
    { code: 'DE', name: 'Almanya', phone: '+49' },
    { code: 'FR', name: 'Fransa', phone: '+33' },
    { code: 'NL', name: 'Hollanda', phone: '+31' },
    { code: 'BE', name: 'Belçika', phone: '+32' },
    { code: 'AT', name: 'Avusturya', phone: '+43' },
    { code: 'CH', name: 'İsviçre', phone: '+41' },
    { code: 'IT', name: 'İtalya', phone: '+39' },
    { code: 'ES', name: 'İspanya', phone: '+34' },
    { code: 'GB', name: 'İngiltere', phone: '+44' },
    { code: 'US', name: 'Amerika', phone: '+1' },
    { code: 'CA', name: 'Kanada', phone: '+1' },
    { code: 'AU', name: 'Avustralya', phone: '+61' },
    { code: 'SE', name: 'İsveç', phone: '+46' },
    { code: 'NO', name: 'Norveç', phone: '+47' },
    { code: 'DK', name: 'Danimarka', phone: '+45' },
    { code: 'FI', name: 'Finlandiya', phone: '+358' },
    { code: 'PL', name: 'Polonya', phone: '+48' },
    { code: 'CZ', name: 'Çekya', phone: '+420' },
    { code: 'HU', name: 'Macaristan', phone: '+36' }
  ];
  const [billingInfos, setBillingInfos] = useState<BillingInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<BillingInfo>>({
    type: 'individual',
    title: '',
    firstName: '',
    lastName: '',
    companyName: '',
    taxNumber: '',
    address: '',
    city: '', // İl
    country: '', // Ülke
    isDefault: false
  });

  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/giris');
    } else if (status === 'authenticated') {
      fetchBillingInfos();
    }
  }, [status, router]);

  // Fatura bilgilerini getir
  const fetchBillingInfos = async () => {
    try {
      const response = await fetch('/api/billing-info', {
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.success) {
        setBillingInfos(result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      logger.error('Fatura bilgileri getirme hatası', { error });
      toast.error('Fatura bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Yeni fatura bilgisi ekle
  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm({
      type: 'individual',
      title: '',
      firstName: '',
      lastName: '',
      companyName: '',
      taxNumber: '',
      address: '',
      city: '', // İl
      country: '', // Ülke
      isDefault: false
    });
  };

  // Fatura bilgisi düzenle
  const handleEdit = (billingInfo: BillingInfo) => {
    setEditingId(billingInfo.id);
    setIsAdding(false);
    setForm({ ...billingInfo });
  };

  // Fatura bilgisi kaydet
  const handleSave = async () => {
    try {
      // Session'dan userId'yi al
      if (!session?.user?.id) {
        toast.error('Oturum bilgisi bulunamadı');
        return;
      }

      // Form validasyonu
      if (!form.title?.trim()) {
        toast.error('Adres başlığı gereklidir');
        return;
      }
      
      if (!form.address?.trim()) {
        toast.error('Adres gereklidir');
        return;
      }
      
      if (!form.city?.trim()) {
        toast.error('İl gereklidir');
        return;
      }
      
      if (!form.country?.trim()) {
        toast.error('Ülke seçimi gereklidir');
        return;
      }
      
      // Bireysel için ad soyad kontrolü
      if (form.type === 'individual') {
        if (!form.firstName?.trim()) {
          toast.error('Ad gereklidir');
          return;
        }
        if (!form.lastName?.trim()) {
          toast.error('Soyad gereklidir');
          return;
        }
      }
      
      // Kurumsal için şirket bilgileri kontrolü
      if (form.type === 'corporate') {
        if (!form.companyName?.trim()) {
          toast.error('Şirket adı gereklidir');
          return;
        }
        if (!form.taxNumber?.trim()) {
          toast.error('Vergi numarası gereklidir');
          return;
        }
      }

      const url = editingId ? '/api/billing-info' : '/api/billing-info';
      const method = editingId ? 'PUT' : 'POST';
      
      // Temiz veri hazırla
      const billingData: any = {
        userId: session.user.id,
        type: form.type,
        title: form.title.trim(),
        firstName: form.firstName?.trim(),
        lastName: form.lastName?.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        isDefault: form.isDefault || false
      };
      
      // Sadece kurumsal ise ekle
      if (form.type === 'corporate') {
        billingData.companyName = form.companyName?.trim();
        billingData.taxNumber = form.taxNumber?.trim();
      }
      
      // Eğer düzenleme ise id ekle
      if (editingId) {
        billingData.id = editingId;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(billingData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingId ? 'Fatura bilgisi güncellendi' : 'Fatura bilgisi eklendi');
        await fetchBillingInfos();
        setEditingId(null);
        setIsAdding(false);
        setForm({});
      } else {
        toast.error(result.message || 'Bir hata oluştu');
      }
    } catch (error) {
      logger.error('Fatura bilgisi kaydetme hatası', { error });
      toast.error('Fatura bilgisi kaydedilemedi');
    }
  };

  // Fatura bilgisi sil
  const handleDelete = async (id: string) => {
    if (!confirm('Bu fatura bilgisini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/billing-info?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Fatura bilgisi silindi');
        await fetchBillingInfos();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      logger.error('Fatura bilgisi silme hatası', { error });
      toast.error('Fatura bilgisi silinemedi');
    }
  };

  // Varsayılan adres ayarla
  const handleSetDefault = async (id: string) => {
    try {
      const billingInfo = billingInfos.find(b => b.id === id);
      if (!billingInfo) return;

      // Session'dan userId'yi al
      if (!session?.user?.id) {
        toast.error('Oturum bilgisi bulunamadı');
        return;
      }

      const billingData: any = {
        id: billingInfo.id,
        userId: session.user.id,
        type: billingInfo.type,
        title: billingInfo.title,
        firstName: billingInfo.firstName,
        lastName: billingInfo.lastName,
        address: billingInfo.address,
        city: billingInfo.city, // İl
        country: billingInfo.country, // Ülke
        isDefault: true
      };

      // Sadece kurumsal ise ekle
      if (billingInfo.type === 'corporate') {
        billingData.companyName = billingInfo.companyName;
        billingData.taxNumber = billingInfo.taxNumber;
      }

      const response = await fetch('/api/billing-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(billingData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Varsayılan adres ayarlandı');
        await fetchBillingInfos();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      logger.error('Varsayılan adres ayarlama hatası', { error });
      toast.error('Varsayılan adres ayarlanamadı');
    }
  };

  // Form iptal et
  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm({});
  };

  // Mobil-first responsive input stilleri
  const inputClass = "w-full px-4 py-3 sm:px-3 sm:py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-[16px] sm:text-[14px] text-gray-800 placeholder-gray-500";
  const selectClass = "w-full px-4 py-3 sm:px-3 sm:py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 text-[16px] sm:text-[14px] text-gray-800";

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Yükleniyor...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Fatura Bilgilerim</h1>
              <button
                onClick={handleAdd}
                className="w-full sm:w-auto px-6 py-3 sm:px-4 sm:py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
              >
                <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
                <span>Yeni Adres Ekle</span>
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {billingInfos.map((billingInfo) => (
                <div 
                  key={billingInfo.id}
                  className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                >
                  {editingId === billingInfo.id ? (
                    <div className="space-y-3">
                      {/* Fatura Tipi Seçimi - Radio Button */}
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4">
                        <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                          <input
                            type="radio"
                            name="billingType"
                            value="individual"
                            checked={form.type === 'individual'}
                            onChange={e => setForm({ ...form, type: e.target.value as 'individual' | 'corporate' })}
                            className="w-5 h-5 sm:w-4 sm:h-4 text-green-600 border-2 border-gray-300 focus:ring-green-500 focus:ring-2"
                          />
                          <span className="text-gray-700 font-medium text-sm sm:text-base">Bireysel</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                          <input
                            type="radio"
                            name="billingType"
                            value="corporate"
                            checked={form.type === 'corporate'}
                            onChange={e => setForm({ ...form, type: e.target.value as 'individual' | 'corporate' })}
                            className="w-5 h-5 sm:w-4 sm:h-4 text-green-600 border-2 border-gray-300 focus:ring-green-500 focus:ring-2"
                          />
                          <span className="text-gray-700 font-medium text-sm sm:text-base">Kurumsal</span>
                        </label>
                      </div>
                      
                      {/* Adres Başlığı */}
                      <input 
                        value={form.title} 
                        onChange={e => setForm({ ...form, title: e.target.value })} 
                        placeholder="Adres Başlığı" 
                        className={inputClass} 
                      />
                      
                      {form.type === 'individual' ? (
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                          <input 
                            value={form.firstName} 
                            onChange={e => setForm({ ...form, firstName: e.target.value })} 
                            placeholder="Ad" 
                            className={inputClass + ' sm:flex-1'} 
                          />
                          <input 
                            value={form.lastName} 
                            onChange={e => setForm({ ...form, lastName: e.target.value })} 
                            placeholder="Soyad" 
                            className={inputClass + ' sm:flex-1'} 
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                          <input 
                            value={form.companyName} 
                            onChange={e => setForm({ ...form, companyName: e.target.value })} 
                            placeholder="Şirket Adı" 
                            className={inputClass + ' sm:flex-1'} 
                          />
                          <input 
                            value={form.taxNumber} 
                            onChange={e => setForm({ ...form, taxNumber: e.target.value })} 
                            placeholder="Vergi Numarası" 
                            className={inputClass + ' sm:flex-1'} 
                          />
                        </div>
                      )}
                      
                      <input 
                        value={form.address} 
                        onChange={e => setForm({ ...form, address: e.target.value })} 
                        placeholder="Tam Adres" 
                        className={inputClass} 
                      />
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                        <input 
                          value={form.city} 
                          onChange={e => setForm({ ...form, city: e.target.value })} 
                          placeholder="İl" 
                          className={inputClass + ' sm:flex-1'} 
                        />
                        <select 
                          value={form.country} 
                          onChange={e => setForm({ ...form, country: e.target.value })} 
                          className={selectClass + ' sm:flex-1'}
                        >
                          <option value="">Ülke Seçin</option>
                          {countries.map(country => (
                            <option key={country.code} value={country.name}>
                              {country.name} ({country.phone})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <input 
                          type="checkbox" 
                          checked={form.isDefault || false}
                          onChange={e => setForm({ ...form, isDefault: e.target.checked })}
                          className="w-5 h-5 sm:w-4 sm:h-4 text-green-600"
                        />
                        <label className="text-sm sm:text-sm text-gray-600 font-medium">Varsayılan Adres</label>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 mt-4">
                        <button 
                          onClick={handleSave} 
                          className="w-full sm:w-auto px-6 py-3 sm:px-4 sm:py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium text-sm sm:text-base"
                        >
                          Kaydet
                        </button>
                        <button 
                          onClick={handleCancel} 
                          className="w-full sm:w-auto px-6 py-3 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-medium text-sm sm:text-base"
                        >
                          Vazgeç
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex items-center gap-3">
                          {billingInfo.type === 'individual' ? (
                            <Home className="w-6 h-6 sm:w-5 sm:h-5 text-blue-600" />
                          ) : (
                            <Building2 className="w-6 h-6 sm:w-5 sm:h-5 text-purple-600" />
                          )}
                          <div>
                            <h3 className="font-medium text-gray-800 text-sm sm:text-base">{billingInfo.title}</h3>
                            {billingInfo.isDefault && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Varsayılan
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 justify-end sm:justify-start">
                          {!billingInfo.isDefault && (
                            <button 
                              onClick={() => handleSetDefault(billingInfo.id)}
                              className="p-3 sm:p-2 text-gray-600 hover:text-green-600 rounded-lg hover:bg-gray-100"
                              title="Varsayılan Yap"
                            >
                              <Check className="w-5 h-5 sm:w-4 sm:h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleEdit(billingInfo)}
                            className="p-3 sm:p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                          >
                            <Edit className="w-5 h-5 sm:w-4 sm:h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(billingInfo.id)}
                            className="p-3 sm:p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100"
                          >
                            <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1 text-gray-600 text-sm sm:text-base">
                        {billingInfo.type === 'individual' ? (
                          <p className="font-medium">{billingInfo.firstName} {billingInfo.lastName}</p>
                        ) : (
                          <>
                            <p className="font-medium">{billingInfo.companyName}</p>
                            <p className="text-xs sm:text-sm">Vergi No: {billingInfo.taxNumber}</p>
                          </>
                        )}
                        <p className="text-gray-700">{billingInfo.address}</p>
                        <p className="text-gray-500">{billingInfo.city} / {billingInfo.country}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {/* Yeni adres ekleme formu */}
              {isAdding && (
                <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white">
                  <div className="space-y-3">
                    {/* Fatura Tipi Seçimi - Radio Button */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4">
                      <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          name="billingTypeNew"
                          value="individual"
                          checked={form.type === 'individual'}
                          onChange={e => setForm({ ...form, type: e.target.value as 'individual' | 'corporate' })}
                          className="w-5 h-5 sm:w-4 sm:h-4 text-green-600 border-2 border-gray-300 focus:ring-green-500 focus:ring-2"
                        />
                        <span className="text-gray-700 font-medium text-sm sm:text-base">Bireysel</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          name="billingTypeNew"
                          value="corporate"
                          checked={form.type === 'corporate'}
                          onChange={e => setForm({ ...form, type: e.target.value as 'individual' | 'corporate' })}
                          className="w-5 h-5 sm:w-4 sm:h-4 text-green-600 border-2 border-gray-300 focus:ring-green-500 focus:ring-2"
                        />
                        <span className="text-gray-700 font-medium text-sm sm:text-base">Kurumsal</span>
                      </label>
                    </div>
                    
                    {/* Adres Başlığı */}
                    <input 
                      value={form.title} 
                      onChange={e => setForm({ ...form, title: e.target.value })} 
                      placeholder="Adres Başlığı" 
                      className={inputClass} 
                    />
                    
                    {form.type === 'individual' ? (
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                        <input 
                          value={form.firstName} 
                          onChange={e => setForm({ ...form, firstName: e.target.value })} 
                          placeholder="Ad" 
                          className={inputClass + ' sm:flex-1'} 
                        />
                        <input 
                          value={form.lastName} 
                          onChange={e => setForm({ ...form, lastName: e.target.value })} 
                          placeholder="Soyad" 
                          className={inputClass + ' sm:flex-1'} 
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                        <input 
                          value={form.companyName} 
                          onChange={e => setForm({ ...form, companyName: e.target.value })} 
                          placeholder="Şirket Adı" 
                          className={inputClass + ' sm:flex-1'} 
                        />
                        <input 
                          value={form.taxNumber} 
                          onChange={e => setForm({ ...form, taxNumber: e.target.value })} 
                          placeholder="Vergi Numarası" 
                          className={inputClass + ' sm:flex-1'} 
                        />
                      </div>
                    )}
                    
                    <input 
                      value={form.address} 
                      onChange={e => setForm({ ...form, address: e.target.value })} 
                      placeholder="Tam Adres" 
                      className={inputClass} 
                    />
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                      <input 
                        value={form.city} 
                        onChange={e => setForm({ ...form, city: e.target.value })} 
                        placeholder="İl" 
                        className={inputClass + ' sm:flex-1'} 
                      />
                      <select 
                        value={form.country} 
                        onChange={e => setForm({ ...form, country: e.target.value })} 
                        className={selectClass + ' sm:flex-1'}
                      >
                        <option value="">Ülke Seçin</option>
                        {countries.map(country => (
                          <option key={country.code} value={country.name}>
                            {country.name} ({country.phone})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <input 
                        type="checkbox" 
                        checked={form.isDefault || false}
                        onChange={e => setForm({ ...form, isDefault: e.target.checked })}
                        className="w-5 h-5 sm:w-4 sm:h-4 text-green-600"
                      />
                      <label className="text-sm sm:text-sm text-gray-600 font-medium">Varsayılan Adres</label>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 mt-4">
                      <button 
                        onClick={handleSave} 
                        className="w-full sm:w-auto px-6 py-3 sm:px-4 sm:py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium text-sm sm:text-base"
                      >
                        Kaydet
                      </button>
                      <button 
                        onClick={handleCancel} 
                        className="w-full sm:w-auto px-6 py-3 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-medium text-sm sm:text-base"
                      >
                        Vazgeç
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Bireysel ve kurumsal fatura bilgilerinizi kaydedebilir, düzenleyebilir veya silebilirsiniz.
                Bilet alırken kayıtlı fatura bilgilerinizi kolayca seçebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}