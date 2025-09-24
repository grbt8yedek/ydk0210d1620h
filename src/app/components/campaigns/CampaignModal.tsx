'use client'
import { useState, useEffect } from 'react'
import { X, Upload, Calendar, Link as LinkIcon, Check } from 'lucide-react'

interface Campaign {
  id: string
  title: string
  description?: string
  imageUrl?: string
  imageData?: string
  altText: string
  linkUrl?: string
  status: 'active' | 'inactive'
  position: number
  startDate?: string
  endDate?: string
  clickCount?: number
  viewCount?: number
  createdAt?: string
  updatedAt?: string
}

interface CampaignModalProps {
  isOpen: boolean
  onClose: () => void
  campaign?: Campaign | null
  onSave: (campaign: any) => void
}

const compressImage = (file: File, quality: number = 0.8, maxWidth: number = 1920): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth }
      canvas.width = width; canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => { resolve(blob ? new File([blob], file.name, { type: file.type }) : file) }, file.type, quality)
    }
    img.src = URL.createObjectURL(file)
  })
}

export default function CampaignModal({ isOpen, onClose, campaign, onSave }: CampaignModalProps) {
  const [formData, setFormData] = useState<Campaign>({ id: '', title: '', description: '', imageUrl: '', imageData: '', altText: '', linkUrl: '', status: 'active', position: 1 })
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    if (campaign) { setFormData(campaign); setImagePreview(campaign.imageUrl || campaign.imageData || '') } else { setFormData({ id: '', title: '', description: '', imageUrl: '', imageData: '', altText: '', linkUrl: '', status: 'active', position: 1 }); setImagePreview('') }
    setUploadSuccess(false)
  }, [campaign])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/')) { alert('Lütfen resim dosyası seçin'); return }
    if (file.size > 2 * 1024 * 1024) { alert('Maksimum 2MB'); return }
    setIsLoading(true); setUploadSuccess(false)
    try {
      const compressed = await compressImage(file, 0.8, 1920)
      const fd = new FormData(); fd.append('file', compressed)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('upload failed')
      const data = await res.json()
      setFormData(prev => ({ ...prev, imageUrl: data.url, imageData: data.url }))
      setImagePreview(data.url); setUploadSuccess(true); setTimeout(() => setUploadSuccess(false), 2500)
    } catch (err) { console.error(err); alert('Yükleme hatası') } finally { setIsLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!formData.title) { alert('Başlık gerekli'); return }
    setIsLoading(true)
    try {
      const res = await fetch('/api/campaigns', { method: campaign ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Kayıt hatası')
      onSave(data.data)
    } catch (err) { console.error(err); alert('Kayıt hatası') } finally { setIsLoading(false) }
  }

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{campaign ? 'Kampanya Düzenle' : 'Yeni Kampanya Ekle'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Kampanya Başlığı *</label>
              <input type="text" required value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Durum</label>
              <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as 'active' | 'inactive' }))} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="active">Aktif</option><option value="inactive">Pasif</option></select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Açıklama</label>
            <textarea value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Kampanya Resmi</label>
            <div className="space-y-4">
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border" />
                  <button type="button" onClick={() => { setImagePreview(''); setFormData(p => ({ ...p, imageUrl: '', imageData: '' })) }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"><X className="h-4 w-4" /></button>
                </div>
              )}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" disabled={isLoading} />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">{isLoading ? 'Yükleniyor...' : 'Resim seç veya sürükle'}</span>
                  <span className="text-xs text-gray-500">PNG, JPG, WEBP, GIF (Max: 2MB)</span>
                </label>
              </div>
              {isLoading && <p className="text-sm text-blue-600 text-center">Resim yükleniyor...</p>}
              {uploadSuccess && <p className="text-sm text-green-600 text-center flex items-center justify-center"><Check className="h-4 w-4 mr-1" />Resim başarıyla yüklendi!</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Alt Text (SEO)</label>
            <input type="text" value={formData.altText} onChange={e => setFormData(p => ({ ...p, altText: e.target.value }))} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Yönlendirme Linki</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="url" value={formData.linkUrl || ''} onChange={e => setFormData(p => ({ ...p, linkUrl: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pozisyon</label>
              <input type="number" min="1" value={formData.position} onChange={e => setFormData(p => ({ ...p, position: parseInt(e.target.value) }))} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Başlangıç Tarihi</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="date" value={formData.startDate || ''} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bitiş Tarihi</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="date" value={formData.endDate || ''} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">İptal</button>
            <button type="submit" disabled={isLoading || !formData.title} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{isLoading ? 'Kaydediliyor...' : (campaign ? 'Güncelle' : 'Kaydet')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
