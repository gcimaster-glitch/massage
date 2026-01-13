import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface Site {
  id: string
  name: string
  type: string
  address: string
  area: string
  lat: number
  lng: number
  host_id: string
  host_name?: string
  is_active?: boolean
}

export default function SiteManagement() {
  const [sites, setSites] = useState<Site[]>([])
  const [filteredSites, setFilteredSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedArea, setSelectedArea] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchSites()
  }, [])

  useEffect(() => {
    filterSites()
  }, [sites, selectedType, selectedArea, searchQuery])

  const fetchSites = async () => {
    try {
      const res = await fetch('/api/sites')
      const data = await res.json()
      setSites(data)
      setFilteredSites(data)
    } catch (e) {
      console.error('Failed to fetch sites:', e)
    } finally {
      setLoading(false)
    }
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

    setFilteredSites(filtered)
  }

  const siteTypes = ['ALL', 'CARE_CUBE', 'HOTEL', 'PRIVATE_SPACE']
  const areas = ['ALL', ...Array.from(new Set(sites.map(s => s.area)))]

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'ALL': 'すべて',
      'CARE_CUBE': 'CARE CUBE',
      'HOTEL': 'ホテル',
      'PRIVATE_SPACE': 'プライベート空間'
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'CARE_CUBE': 'bg-blue-100 text-blue-800',
      'HOTEL': 'bg-purple-100 text-purple-800',
      'PRIVATE_SPACE': 'bg-green-100 text-green-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const siteTypeStats = sites.reduce((acc, site) => {
    acc[site.type] = (acc[site.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                <i className="fas fa-map-marked-alt mr-3 text-blue-600"></i>
                施設管理
              </h1>
              <p className="text-gray-600">CARE CUBE施設と施設ホストの管理</p>
            </div>
            <Link
              to="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              管理画面へ戻る
            </Link>
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <i className="fas fa-map-marker-alt text-2xl text-blue-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">総施設数</p>
                <p className="text-2xl font-bold text-gray-900">{sites.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <i className="fas fa-cube text-2xl text-blue-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">CARE CUBE</p>
                <p className="text-2xl font-bold text-blue-900">
                  {siteTypeStats['CARE_CUBE'] || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <i className="fas fa-hotel text-2xl text-purple-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">ホテル</p>
                <p className="text-2xl font-bold text-purple-900">
                  {siteTypeStats['HOTEL'] || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <i className="fas fa-home text-2xl text-green-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">プライベート</p>
                <p className="text-2xl font-bold text-green-900">
                  {siteTypeStats['PRIVATE_SPACE'] || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* タイプフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                施設タイプ
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {siteTypes.map(type => (
                  <option key={type} value={type}>
                    {getTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            {/* エリアフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                エリア
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {areas.map(area => (
                  <option key={area} value={area}>
                    {area === 'ALL' ? 'すべて' : area}
                  </option>
                ))}
              </select>
            </div>

            {/* 検索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                検索
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="施設名・住所で検索"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {filteredSites.length}件の施設が見つかりました
          </div>
        </div>

        {/* 施設一覧 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              施設一覧
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredSites.map((site) => (
              <div key={site.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">
                        {site.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(site.type)}`}>
                        {getTypeLabel(site.type)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">エリア</p>
                        <p className="text-sm font-medium text-gray-900">{site.area}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">住所</p>
                        <p className="text-sm font-medium text-gray-900">{site.address}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ホスト</p>
                        <p className="text-sm font-medium text-gray-900">{site.host_name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">座標</p>
                        <p className="text-sm font-medium text-gray-900">
                          {site.lat.toFixed(4)}, {site.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center space-x-4">
                      <a
                        href={`https://www.google.com/maps?q=${site.lat},${site.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        地図で見る
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
