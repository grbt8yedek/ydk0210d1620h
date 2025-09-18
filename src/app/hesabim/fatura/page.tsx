'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Building2, Home, Plus, Trash2, Edit, Check } from 'lucide-react';
import toast from 'react-hot-toast';

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
    taxOffice: '',
    taxNumber: '',
    address: '',
    district: '',
    city: '',
    country: '',
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
      console.error('Fatura bilgileri getirme hatası:', error);
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
      taxOffice: '',
      taxNumber: '',
      address: '',
      district: '',
      city: '',
      country: '',
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
      const url = editingId ? '/api/billing-info' : '/api/billing-info';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          ...(editingId && { id: editingId })
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingId ? 'Fatura bilgisi güncellendi' : 'Fatura bilgisi eklendi');
        await fetchBillingInfos();
        setEditingId(null);
        setIsAdding(false);
        setForm({});
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Fatura bilgisi kaydetme hatası:', error);
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
      console.error('Fatura bilgisi silme hatası:', error);
      toast.error('Fatura bilgisi silinemedi');
    }
  };

  // Varsayılan adres ayarla
  const handleSetDefault = async (id: string) => {
    try {
      const billingInfo = billingInfos.find(b => b.id === id);
      if (!billingInfo) return;

      const response = await fetch('/api/billing-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...billingInfo,
          isDefault: true
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Varsayılan adres ayarlandı');
        await fetchBillingInfos();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Varsayılan adres ayarlama hatası:', error);
      toast.error('Varsayılan adres ayarlanamadı');
    }
  };

  // Form iptal et
  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm({});
  };

  const inputClass = "w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-[16px] text-gray-800";
  const selectClass = "w-full px-3 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-green-500 text-[16px]";

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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Fatura Bilgilerim</h1>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Adres Ekle</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {billingInfos.map((billingInfo) => (
                <div 
                  key={billingInfo.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  {editingId === billingInfo.id ? (
                    <div className="space-y-3">
                      {/* Fatura Tipi Seçimi - Radio Button */}
                      <div className="flex gap-6 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="billingType"
                            value="individual"
                            checked={form.type === 'individual'}
                            onChange={e => setForm({ ...form, type: e.target.value as 'individual' | 'corporate' })}
                            className="w-4 h-4 text-green-600 border-2 border-gray-300 focus:ring-green-500 focus:ring-2"
                          />
                          <span className="text-gray-700 font-medium">Bireysel</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="billingType"
                            value="corporate"
                            checked={form.type === 'corporate'}
                            onChange={e => setForm({ ...form, type: e.target.value as 'individual' | 'corporate' })}
                            className="w-4 h-4 text-green-600 border-2 border-gray-300 focus:ring-green-500 focus:ring-2"
                          />
                          <span className="text-gray-700 font-medium">Kurumsal</span>
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
                        <>
                          <div className="flex gap-2">
                            <input 
                              value={form.firstName} 
                              onChange={e => setForm({ ...form, firstName: e.target.value })} 
                              placeholder="Ad" 
                              className={inputClass + ' flex-1'} 
                            />
                            <input 
                              value={form.lastName} 
                              onChange={e => setForm({ ...form, lastName: e.target.value })} 
                              placeholder="Soyad" 
                              className={inputClass + ' flex-1'} 
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <input 
                            value={form.companyName} 
                            onChange={e => setForm({ ...form, companyName: e.target.value })} 
                            placeholder="Şirket Adı" 
                            className={inputClass} 
                          />
                          <div className="flex gap-2">
                            <input 
                              value={form.taxOffice} 
                              onChange={e => setForm({ ...form, taxOffice: e.target.value })} 
                              placeholder="Vergi Dairesi" 
                              className={inputClass + ' flex-1'} 
                            />
                            <input 
                              value={form.taxNumber} 
                              onChange={e => setForm({ ...form, taxNumber: e.target.value })} 
                              placeholder="Vergi Numarası" 
                              className={inputClass + ' flex-1'} 
                            />
                          </div>
                        </>
                      )}
                      
                      <input 
                        value={form.address} 
                        onChange={e => setForm({ ...form, address: e.target.value })} 
                        placeholder="Tam Adres" 
                        className={inputClass} 
                      />
                      <div className="flex gap-2">
                        <input 
                          value={form.district} 
                          onChange={e => setForm({ ...form, district: e.target.value })} 
                          placeholder="İlçe" 
                          className={inputClass + ' flex-1'} 
                        />
                        <input 
                          value={form.city} 
                          onChange={e => setForm({ ...form, city: e.target.value })} 
                          placeholder="Şehir/İl" 
                          className={inputClass + ' flex-1'} 
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={form.isDefault || false}
                          onChange={e => setForm({ ...form, isDefault: e.target.checked })}
                          className="w-4 h-4 text-green-600"
                        />
                        <label className="text-sm text-gray-600">Varsayılan Adres</label>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={handleSave} 
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Kaydet
                        </button>
                        <button 
                          onClick={handleCancel} 
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          Vazgeç
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {billingInfo.type === 'individual' ? (
                            <Home className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Building2 className="w-5 h-5 text-purple-600" />
                          )}
                          <div>
                            <h3 className="font-medium text-gray-800">{billingInfo.title}</h3>
                            {billingInfo.isDefault && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Varsayılan
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!billingInfo.isDefault && (
                            <button 
                              onClick={() => handleSetDefault(billingInfo.id)}
                              className="p-2 text-gray-600 hover:text-green-600 rounded-lg hover:bg-gray-100"
                              title="Varsayılan Yap"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleEdit(billingInfo)}
                            className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(billingInfo.id)}
                            className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1 text-gray-600">
                        {billingInfo.type === 'individual' ? (
                          <p>{billingInfo.firstName} {billingInfo.lastName}</p>
                        ) : (
                          <>
                            <p>{billingInfo.companyName}</p>
                            <p>Vergi Dairesi: {billingInfo.taxOffice}</p>
                            <p>Vergi No: {billingInfo.taxNumber}</p>
                          </>
                        )}
                        <p>{billingInfo.address}</p>
                        <p>{billingInfo.district} / {billingInfo.city}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {/* Yeni adres ekleme formu */}
              {isAdding && (
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="space-y-3">
                    {/* Fatura Tipi Seçimi - Radio Button */}
                    <div className="flex gap-6 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="billingTypeNew"
                          value="individual"
                          checked={form.type === 'individual'}
                          onChange={e => setForm({ ...form, type: e.target.value as 'individual' | 'corporate' })}
                          className="w-4 h-4 text-green-600 border-2 border-gray-300 focus:ring-green-500 focus:ring-2"
                        />
                        <span className="text-gray-700 font-medium">Bireysel</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="billingTypeNew"
                          value="corporate"
                          checked={form.type === 'corporate'}
                          onChange={e => setForm({ ...form, type: e.target.value as 'individual' | 'corporate' })}
                          className="w-4 h-4 text-green-600 border-2 border-gray-300 focus:ring-green-500 focus:ring-2"
                        />
                        <span className="text-gray-700 font-medium">Kurumsal</span>
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
                      <div className="flex gap-2">
                        <input 
                          value={form.firstName} 
                          onChange={e => setForm({ ...form, firstName: e.target.value })} 
                          placeholder="Ad" 
                          className={inputClass + ' flex-1'} 
                        />
                        <input 
                          value={form.lastName} 
                          onChange={e => setForm({ ...form, lastName: e.target.value })} 
                          placeholder="Soyad" 
                          className={inputClass + ' flex-1'} 
                        />
                      </div>
                    ) : (
                      <>
                        <input 
                          value={form.companyName} 
                          onChange={e => setForm({ ...form, companyName: e.target.value })} 
                          placeholder="Şirket Adı" 
                          className={inputClass} 
                        />
                        <div className="flex gap-2">
                          <input 
                            value={form.taxOffice} 
                            onChange={e => setForm({ ...form, taxOffice: e.target.value })} 
                            placeholder="Vergi Dairesi" 
                            className={inputClass + ' flex-1'} 
                          />
                          <input 
                            value={form.taxNumber} 
                            onChange={e => setForm({ ...form, taxNumber: e.target.value })} 
                            placeholder="Vergi Numarası" 
                            className={inputClass + ' flex-1'} 
                          />
                        </div>
                      </>
                    )}
                    
                    <input 
                      value={form.address} 
                      onChange={e => setForm({ ...form, address: e.target.value })} 
                      placeholder="Tam Adres" 
                      className={inputClass} 
                    />
                    <div className="flex gap-2">
                      <input 
                        value={form.district} 
                        onChange={e => setForm({ ...form, district: e.target.value })} 
                        placeholder="İlçe" 
                        className={inputClass + ' flex-1'} 
                      />
                      <input 
                        value={form.city} 
                        onChange={e => setForm({ ...form, city: e.target.value })} 
                        placeholder="Şehir/İl" 
                        className={inputClass + ' flex-1'} 
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={form.isDefault || false}
                        onChange={e => setForm({ ...form, isDefault: e.target.checked })}
                        className="w-4 h-4 text-green-600"
                      />
                      <label className="text-sm text-gray-600">Varsayılan Adres</label>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={handleSave} 
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Kaydet
                      </button>
                      <button 
                        onClick={handleCancel} 
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Vazgeç
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
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