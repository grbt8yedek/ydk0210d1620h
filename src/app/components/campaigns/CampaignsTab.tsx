'use client'
import { useState, useEffect } from 'react'
import { Globe, Plus, Edit, Trash2, Link, Calendar } from 'lucide-react'
import CampaignModal from './CampaignModal'

export type Campaign = {
  id: string
  title: string
  description?: string
  imageUrl?: string
  imageData?: string
  altText: string
  linkUrl?: string
  status: 'active' | 'inactive'
  position: number
  clickCount?: number
  viewCount?: number
  startDate?: string
  endDate?: string
  createdAt?: string
  updatedAt?: string
}

export default function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number | null>(null)

  const CACHE_DURATION = 2 * 60 * 1000

  const fetchCampaigns = async (forceRefresh = false) => {
    const now = Date.now()
    if (!forceRefresh && lastFetch && (now - lastFetch) < CACHE_DURATION) return
    try {
      setLoading(campaigns.length === 0)
      const res = await fetch('/api/campaigns')
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      setCampaigns((data.data || []) as Campaign[])
      setLastFetch(now)
    } catch (e) {
      setError('Kampanyalar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCampaigns() }, [])

  const handleSaveCampaign = (saved: any) => {
    const s = saved as Campaign
    setCampaigns(prev => {
      const idx = prev.findIndex(c => c.id === s.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = s; return next }
      return [...prev, s]
    })
    setIsModalOpen(false); setSelectedCampaign(null)
  }

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Bu kampanyayı silmek istediğinizden emin misiniz?')) return
    const original = campaigns
    setCampaigns(prev => prev.filter(c => c.id !== id))
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
    } catch (e) {
      setCampaigns(original); alert('Kampanya silme hatası')
    }
  }

  const handleEditCampaign = (c: Campaign) => { setSelectedCampaign(c); setIsModalOpen(true) }
  const handleAddCampaign = () => { setSelectedCampaign(null); setIsModalOpen(true) }

  if (loading) return (
    <div className="w-full space-y-6 min-w-0">
      <div className="bg-white rounded-lg shadow p-4 w-full">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    </div>
  )

  if (error) return (
    <div className="w-full space-y-6 min-w-0">
      <div className="bg-white rounded-lg shadow p-4 w-full text-center text-red-600">
        <p>{error}</p>
        <button onClick={() => fetchCampaigns(true)} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Tekrar Dene</button>
      </div>
    </div>
  )

  return (
    <div className="w-full space-y-6 min-w-0">
      <div className="bg-white rounded-lg shadow p-4 w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium text-gray-900">Kampanya Yönetimi</h3>
            <span className="text-sm text-gray-500">({campaigns.length} kampanya)</span>
          </div>
          <button onClick={handleAddCampaign} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            <span>+ Yeni Kampanya</span>
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz kampanya yok</h3>
            <p className="text-gray-500 mb-4">İlk kampanyanızı oluşturmak için "Yeni Kampanya" butonuna tıklayın.</p>
            <button onClick={handleAddCampaign} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">İlk Kampanyayı Oluştur</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((c) => (
              <div key={c.id} className="relative p-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button onClick={() => handleEditCampaign(c)} className="p-1 hover:bg-white/20 rounded" title="Düzenle"><Edit className="h-3 w-3" /></button>
                  <button onClick={() => handleDeleteCampaign(c.id)} className="p-1 hover:bg-white/20 rounded" title="Sil"><Trash2 className="h-3 w-3" /></button>
                </div>
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">{c.title}</div>
                  {c.description && <div className="text-xs opacity-90 mb-2 line-clamp-2">{c.description}</div>}
                  {(c.startDate || c.endDate) && (
                    <div className="text-xs opacity-90 mb-2 flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {c.startDate && new Date(c.startDate).toLocaleDateString('tr-TR')}
                        {c.endDate && ` - ${new Date(c.endDate).toLocaleDateString('tr-TR')}`}
                      </span>
                    </div>
                  )}
                  <div className="mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${c.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{c.status === 'active' ? 'Aktif' : 'Pasif'}</span>
                  </div>
                  <div className="text-xs opacity-90 mt-1">Pozisyon: {c.position}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CampaignModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedCampaign(null) }} campaign={selectedCampaign as any} onSave={handleSaveCampaign} />
    </div>
  )
}
