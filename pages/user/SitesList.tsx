import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, Search, Filter, Grid, Map as MapIcon, Star, Navigation, Building2, Home } from 'lucide-react'

interface Site {
  id: string
  name: string
  type: string
  address: string
  area: string
  lat: number
  lng: number
  host_name?: string
  distance?: number
}

export default function SitesList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [sites, setSites] = useState<Site[]>([])
  const [filteredSites, setFilteredSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [selectedType, setSelectedType] = useState<string>(searchParams.get('type') || 'ALL')
  const [selectedArea, setSelectedArea] = useState<string>(searchParams.get('area') || 'ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    fetchSites()
    getUserLocation()
  }, [])

  useEffect(() => {
    filterSites()
  }, [sites, selectedType, selectedArea, searchQuery, userLocation])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('位置情報の取得に失敗しました:', error)
        }
      )
    }
  }

  const fetchSites = async () => {
    try {
      const res = await fetch('/api/sites')
      const data = await res.json()
      setSites(data)
    } catch (e) {
      console.error('Failed to fetch sites:', e)
    } finally {
      setLoading(false)
    }
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // 地球の半径 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const filterSites = () => {
    let filtered = [...sites]

    if (selectedType !== 'ALL') {
      filtered = filtered.filter(s => s.type === selectedType)
    }

    if (selectedArea !== 'ALL') {
      filtered = filtered.filter(s => s.area === selectedArea)
    }

    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 距離を計算
    if (userLocation) {
      filtered = filtered.map(site => ({
        ...site,
        distance: calculateDistance(userLocation.lat, userLocation.lng, site.lat, site.lng)
      }))
      // 距離でソート
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    setFilteredSites(filtered)
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'ALL': 'すべて',
      'CARE_CUBE': 'CARE CUBE',
      'HOTEL': 'ホテル',
      'PRIVATE_SPACE': 'プライベート空間'
    }
    return labels[type] || type
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CARE_CUBE':
        return <Grid size={20} className="text-blue-600" />
      case 'HOTEL':
        return <Building2 size={20} className="text-purple-600" />
      case 'PRIVATE_SPACE':
        return <Home size={20} className="text-green-600" />
      default:
        return <MapPin size={20} />
    }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'CARE_CUBE': 'bg-blue-50 border-blue-200 text-blue-700',
      'HOTEL': 'bg-purple-50 border-purple-200 text-purple-700',
      'PRIVATE_SPACE': 'bg-green-50 border-green-200 text-green-700'
    }
    return colors[type] || 'bg-gray-50 border-gray-200 text-gray-700'
  }

  const areas = ['ALL', ...Array.from(new Set(sites.map(s => s.area)))]
  const siteTypes = ['ALL', 'CARE_CUBE', 'HOTEL', 'PRIVATE_SPACE']

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">施設を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                <MapPin className="inline mr-3 text-teal-600" size={32} />
                施設を探す
              </h1>
              <p className="text-gray-600">
                全{filteredSites.length}箇所の施設からお選びください
              </p>
            </div>
            
            {/* ビューモード切替 */}
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${
                  viewMode === 'grid' ? 'bg-white text-teal-600 shadow' : 'text-gray-600'
                }`}
              >
                <Grid size={18} />
                一覧
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${
                  viewMode === 'map' ? 'bg-white text-teal-600 shadow' : 'text-gray-600'
                }`}
              >
                <MapIcon size={18} />
                地図
              </button>
            </div>
          </div>

          {/* 検索・フィルター */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 検索 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="施設名・住所で検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* タイプフィルター */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {siteTypes.map(type => (
                <option key={type} value={type}>{getTypeLabel(type)}</option>
              ))}
            </select>

            {/* エリアフィルター */}
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {areas.map(area => (
                <option key={area} value={area}>{area === 'ALL' ? 'すべてのエリア' : area}</option>
              ))}
            </select>

            {/* 現在地から探す */}
            {userLocation && (
              <button
                onClick={getUserLocation}
                className="px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-2"
              >
                <Navigation size={18} />
                現在地から探す
              </button>
            )}
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {viewMode === 'grid' ? (
          // グリッドビュー
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map(site => (
              <div
                key={site.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/app/sites/${site.id}`)}
              >
                {/* 施設タイプバッジ */}
                <div className={`px-4 py-3 border-b flex items-center justify-between ${getTypeColor(site.type)}`}>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(site.type)}
                    <span className="font-bold text-sm">{getTypeLabel(site.type)}</span>
                  </div>
                  {site.distance && (
                    <span className="text-xs font-semibold">
                      <Navigation size={12} className="inline mr-1" />
                      {site.distance.toFixed(1)}km
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{site.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
                      <span>{site.address}</span>
                    </div>
                    {site.host_name && (
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="flex-shrink-0 text-gray-400" />
                        <span>{site.host_name}</span>
                      </div>
                    )}
                  </div>

                  <button className="mt-4 w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition font-semibold">
                    この施設で予約
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 地図ビュー (次のステップで実装)
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center text-gray-500">
              <MapIcon size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold mb-2">地図ビューは準備中です</p>
              <p className="text-sm">Google Maps統合を実装予定</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
