'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Campaign {
  id: string
  title: string
  description: string
  imageUrl: string | null
  imageData?: string | null
  altText: string
  linkUrl: string
  status: 'active' | 'inactive'
  position: number
  clickCount: number
  viewCount: number
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
}

export default function CampaignsSection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Cache süresi: 5 dakika
  const CACHE_DURATION = 5 * 60 * 1000

  // Cache kontrolü ile kampanyaları getir
  const fetchCampaigns = useCallback(async (forceRefresh = false) => {
    const now = Date.now()
    
    // Cache kontrolü
    if (!forceRefresh && lastFetch && (now - lastFetch) < CACHE_DURATION) {
      console.log('Cache\'den kampanyalar kullanılıyor')
      return
    }

    try {
      setError(null)
      console.log('Fetching campaigns...')
      
      const response = await fetch('/api/campaigns', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        cache: 'no-store'
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data)
        
        if (data.success && data.data && Array.isArray(data.data)) {
          // Sadece aktif kampanyaları al ve pozisyona göre sırala
          const activeCampaigns = data.data
            .filter((campaign: Campaign) => campaign.status === 'active')
            .sort((a: Campaign, b: Campaign) => a.position - b.position)
            .slice(0, 4) // Maksimum 4 kampanya
          
          console.log('Active campaigns:', activeCampaigns)
          setCampaigns(activeCampaigns)
          setLastFetch(now)
        } else {
          console.log('No valid data received:', data)
          setError('Geçerli veri alınamadı')
        }
      } else {
        console.error('API response not ok:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response:', errorText)
        setError(`API Hatası: ${response.status}`)
      }
    } catch (error) {
      console.error('Kampanyalar yüklenirken hata:', error)
      setError('Kampanyalar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [lastFetch, CACHE_DURATION])

  // Optimistic update ile kampanya kaydetme
  const handleSaveCampaign = useCallback(async (campaign: Campaign) => {
    try {
      // UI'yi hemen güncelle (Optimistic Update)
      if (campaign.id) {
        setCampaigns(prev => prev.map(c => c.id === campaign.id ? campaign : c))
      } else {
        const tempId = `temp-${Date.now()}`
        setCampaigns(prev => [...prev, { ...campaign, id: tempId }])
      }

      const response = await fetch('/api/campaigns', {
        method: campaign.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign)
      })

      if (response.ok) {
        const result = await response.json()
        if (!campaign.id && result.data) {
          // Temp ID'yi gerçek ID ile değiştir
          setCampaigns(prev => prev.map(c => 
            c.id.startsWith('temp-') ? result.data : c
          ))
        }
        // Cache'i temizle
        setLastFetch(null)
      } else {
        // Hata durumunda geri al
        await fetchCampaigns(true)
      }
    } catch (error) {
      console.error('Kampanya kaydetme hatası:', error)
      // Hata durumunda yenile
      await fetchCampaigns(true)
    }
  }, [fetchCampaigns])

  // Optimistic update ile kampanya silme
  const handleDeleteCampaign = useCallback(async (id: string) => {
    if (!confirm('Silmek istediğinizden emin misiniz?')) return
    
    const originalCampaigns = campaigns
    setCampaigns(prev => prev.filter(c => c.id !== id))

    try {
      const response = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        setCampaigns(originalCampaigns) // Geri al
        throw new Error('Silme işlemi başarısız')
      }
      // Cache'i temizle
      setLastFetch(null)
    } catch (error) {
      console.error('Kampanya silme hatası:', error)
      setCampaigns(originalCampaigns) // Geri al
    }
  }, [campaigns])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  // Skeleton loading component
  const SkeletonCard = useMemo(() => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  ), [])

  // Memoized campaign click handler
  const handleCampaignClick = useCallback(async (campaignId: string) => {
    try {
      // Optimistic update: tıklama sayısını hemen artır
      setCampaigns(prev => prev.map(c => 
        c.id === campaignId 
          ? { ...c, clickCount: c.clickCount + 1 }
          : c
      ))

      // API'ye gönder
      await fetch(`/api/campaigns/${campaignId}/click`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Tıklama sayacı güncellenirken hata:', error)
      // Hata durumunda geri al
      setCampaigns(prev => prev.map(c => 
        c.id === campaignId 
          ? { ...c, clickCount: Math.max(0, c.clickCount - 1) }
          : c
      ))
    }
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="w-full sm:container sm:mx-auto px-2 sm:px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              {SkeletonCard}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="w-full sm:container sm:mx-auto px-2 sm:px-4 py-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchCampaigns(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (campaigns.length === 0) {
    return null // Kampanya yoksa bölümü gizle
  }

  return (
    <div className="w-full sm:container sm:mx-auto px-2 sm:px-4 pt-2 pb-6 sm:py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {campaigns.map((campaign, index) => (
          <div key={campaign.id} className="bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {campaign.linkUrl ? (
              <Link 
                href={campaign.linkUrl}
                onClick={() => handleCampaignClick(campaign.id)}
                className="block"
              >
                <div className="relative w-full h-48 cursor-pointer">
                  {campaign.imageUrl || campaign.imageData ? (
                    <Image
                      src={(campaign.imageUrl && campaign.imageUrl.startsWith('data:'))
                        ? campaign.imageUrl
                        : (campaign.imageData && campaign.imageData.startsWith('data:'))
                          ? campaign.imageData
                          : `https://www.grbt8.store${campaign.imageUrl}`}
                      alt={campaign.altText}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      quality={80}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      priority={index === 0}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">{campaign.title}</span>
                    </div>
                  )}
                  {/* Overlay caption - bottom 20% gray with white text */}
                  <div className="absolute inset-x-0 bottom-0 h-[20%] bg-gray-900/35 flex items-center">
                    <div className="px-3 w-full">
                      <h3 className="text-white text-sm font-semibold truncate">{campaign.title}</h3>
                      <p className="text-white/90 text-xs truncate">{campaign.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="relative w-full h-48">
                {campaign.imageUrl || campaign.imageData ? (
                  <Image
                    src={(campaign.imageUrl && campaign.imageUrl.startsWith('data:'))
                      ? campaign.imageUrl
                      : (campaign.imageData && campaign.imageData.startsWith('data:'))
                        ? campaign.imageData
                        : `https://www.grbt8.store${campaign.imageUrl}`}
                    alt={campaign.altText}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    quality={80}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    priority={index === 0}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">{campaign.title}</span>
                  </div>
                )}
                {/* Overlay caption - bottom 20% gray with white text */}
                <div className="absolute inset-x-0 bottom-0 h-[20%] bg-gray-900/35 flex items-center">
                  <div className="px-3 w-full">
                    <h3 className="text-white text-sm font-semibold truncate">{campaign.title}</h3>
                    <p className="text-white/90 text-xs truncate">{campaign.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 