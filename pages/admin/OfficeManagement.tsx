import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface Office {
  id: string
  name: string
  area: string
  manager_name: string
  contact_email: string
  commission_rate: number
  therapist_count: number
  status: string
  owner_name?: string
}

interface Therapist {
  id: string
  name: string
  rating: number
  review_count: number
  specialties: string
  approved_areas: string
}

export default function OfficeManagement() {
  const [offices, setOffices] = useState<Office[]>([])
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null)
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOffices()
  }, [])

  useEffect(() => {
    if (selectedOffice) {
      fetchOfficeTherapists(selectedOffice)
    }
  }, [selectedOffice])

  const fetchOffices = async () => {
    try {
      const res = await fetch('/api/offices')
      const data = await res.json()
      setOffices(data)
    } catch (e) {
      console.error('Failed to fetch offices:', e)
    } finally {
      setLoading(false)
    }
  }

  const fetchOfficeTherapists = async (officeId: string) => {
    try {
      const res = await fetch(`/api/offices/${officeId}`)
      const data = await res.json()
      setTherapists(data.therapists || [])
    } catch (e) {
      console.error('Failed to fetch therapists:', e)
    }
  }

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
                <i className="fas fa-building mr-3 text-blue-600"></i>
                事務所管理
              </h1>
              <p className="text-gray-600">セラピスト事務所の管理と統計</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <i className="fas fa-building text-2xl text-blue-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">総事務所数</p>
                <p className="text-2xl font-bold text-gray-900">{offices.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <i className="fas fa-user-md text-2xl text-green-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">総セラピスト数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {offices.reduce((sum, o) => sum + o.therapist_count, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <i className="fas fa-percentage text-2xl text-purple-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">平均コミッション率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(offices.reduce((sum, o) => sum + o.commission_rate, 0) / offices.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 事務所一覧 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              事務所一覧
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {offices.map((office) => (
              <div
                key={office.id}
                className={`p-6 hover:bg-gray-50 cursor-pointer transition ${
                  selectedOffice === office.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedOffice(office.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">
                        {office.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        office.status === 'APPROVED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {office.status === 'APPROVED' ? '承認済み' : office.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">エリア</p>
                        <p className="text-sm font-medium text-gray-900">{office.area}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">管理者</p>
                        <p className="text-sm font-medium text-gray-900">{office.manager_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">セラピスト数</p>
                        <p className="text-sm font-medium text-gray-900">
                          <i className="fas fa-user-md mr-1 text-blue-600"></i>
                          {office.therapist_count}名
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">コミッション率</p>
                        <p className="text-sm font-medium text-gray-900">
                          {office.commission_rate}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center text-sm text-gray-600">
                      <i className="fas fa-envelope mr-2"></i>
                      {office.contact_email}
                    </div>
                  </div>

                  <button
                    className="ml-4 text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedOffice(office.id)
                    }}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>

                {/* 所属セラピスト（選択時） */}
                {selectedOffice === office.id && therapists.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      所属セラピスト ({therapists.length}名)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {therapists.map((therapist) => (
                        <div
                          key={therapist.id}
                          className="flex items-center p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {therapist.name.charAt(0)}
                          </div>
                          <div className="ml-4 flex-1">
                            <h5 className="font-medium text-gray-900">{therapist.name}</h5>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <i className="fas fa-star text-yellow-400 mr-1"></i>
                              {therapist.rating} ({therapist.review_count}件)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
