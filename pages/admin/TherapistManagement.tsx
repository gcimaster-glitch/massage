import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCheck, Search, Download, RefreshCw, CheckCircle, XCircle,
  AlertCircle, Star, Award, TrendingUp, Eye, Mail, Phone, MapPin
} from 'lucide-react';
import SimpleLayout from '../../components/SimpleLayout';

interface Therapist {
  id: string;
  email: string;
  name: string;
  phone: string;
  specialties: string[];
  certifications: string[];
  rating: number;
  total_sessions: number;
  approval_status: string;
  kyc_status: string;
  status: string;
  created_at: string;
  last_active: string;
}

const TherapistManagement: React.FC = () => {
  const navigate = useNavigate();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedTherapists, setSelectedTherapists] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchTherapists();
  }, []);

  useEffect(() => {
    filterTherapists();
  }, [therapists, searchQuery, approvalFilter, ratingFilter]);

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/therapists', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTherapists(data.therapists || []);
      } else {
        // モックデータ
        setTherapists([
          {
            id: 'therapist-001',
            email: 'tanaka@example.com',
            name: '田中 有紀',
            phone: '090-1111-2222',
            specialties: ['ボディケア', 'リラクゼーション'],
            certifications: ['あん摩マッサージ指圧師', '柔道整復師'],
            rating: 4.8,
            total_sessions: 245,
            approval_status: 'APPROVED',
            kyc_status: 'APPROVED',
            status: 'ACTIVE',
            created_at: '2025-12-01',
            last_active: '2026-01-22 14:30'
          },
          {
            id: 'therapist-002',
            email: 'suzuki@example.com',
            name: '鈴木 美咲',
            phone: '090-2222-3333',
            specialties: ['アロマセラピー', 'リンパドレナージュ'],
            certifications: ['アロマセラピスト'],
            rating: 4.9,
            total_sessions: 189,
            approval_status: 'APPROVED',
            kyc_status: 'APPROVED',
            status: 'ACTIVE',
            created_at: '2025-11-15',
            last_active: '2026-01-22 13:00'
          },
          {
            id: 'therapist-003',
            email: 'yamamoto@example.com',
            name: '山本 さくら',
            phone: '090-3333-4444',
            specialties: ['ボディケア'],
            certifications: [],
            rating: 0,
            total_sessions: 0,
            approval_status: 'PENDING',
            kyc_status: 'PENDING',
            status: 'PENDING',
            created_at: '2026-01-20',
            last_active: '2026-01-20 10:00'
          },
          {
            id: 'therapist-004',
            email: 'ito@example.com',
            name: '伊藤 良太',
            phone: '090-4444-5555',
            specialties: ['整体', 'ストレッチ'],
            certifications: ['柔道整復師'],
            rating: 4.6,
            total_sessions: 156,
            approval_status: 'APPROVED',
            kyc_status: 'APPROVED',
            status: 'SUSPENDED',
            created_at: '2025-10-20',
            last_active: '2026-01-15 09:00'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch therapists:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTherapists = () => {
    let filtered = [...therapists];

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(t.specialties) && t.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    // 承認ステータスフィルター
    if (approvalFilter !== 'all') {
      filtered = filtered.filter(t => t.approval_status === approvalFilter);
    }

    // 評価フィルター
    if (ratingFilter !== 'all') {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(t => t.rating >= minRating);
    }

    setFilteredTherapists(filtered);
  };

  const handleSelectAll = () => {
    if (selectedTherapists.length === filteredTherapists.length) {
      setSelectedTherapists([]);
      setShowBulkActions(false);
    } else {
      setSelectedTherapists(filteredTherapists.map(t => t.id));
      setShowBulkActions(true);
    }
  };

  const handleSelectTherapist = (therapistId: string) => {
    if (selectedTherapists.includes(therapistId)) {
      const newSelected = selectedTherapists.filter(id => id !== therapistId);
      setSelectedTherapists(newSelected);
      setShowBulkActions(newSelected.length > 0);
    } else {
      const newSelected = [...selectedTherapists, therapistId];
      setSelectedTherapists(newSelected);
      setShowBulkActions(true);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedTherapists.length === 0) return;

    const confirmation = window.confirm(
      `選択した${selectedTherapists.length}件のセラピストに対して「${action}」を実行しますか？`
    );

    if (!confirmation) return;

    alert(`${action}を実行しました（実装準備中）`);
    setSelectedTherapists([]);
    setShowBulkActions(false);
  };

  const handleApprove = async (therapistId: string) => {
    const confirmation = window.confirm('このセラピストを承認しますか？');
    if (!confirmation) return;

    alert('承認しました（実装準備中）');
    fetchTherapists();
  };

  const handleReject = async (therapistId: string) => {
    const confirmation = window.confirm('このセラピストを却下しますか？');
    if (!confirmation) return;

    alert('却下しました（実装準備中）');
    fetchTherapists();
  };

  const handleExportCSV = () => {
    const csv = [
      ['ID', '氏名', 'メール', '電話番号', '専門分野', '資格', '評価', 'セッション数', '承認ステータス', 'KYC', 'ステータス', '登録日'].join(','),
      ...filteredTherapists.map(t => 
        [
          t.id, 
          t.name, 
          t.email, 
          t.phone, 
          Array.isArray(t.specialties) ? t.specialties.join(';') : '', 
          Array.isArray(t.certifications) ? t.certifications.join(';') : '', 
          t.rating, 
          t.total_sessions, 
          t.approval_status, 
          t.kyc_status, 
          t.status, 
          t.created_at
        ].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `therapists_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle size={12} />承認済</span>;
      case 'PENDING':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 flex items-center gap-1"><AlertCircle size={12} />審査中</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1"><XCircle size={12} />却下</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">未申請</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">稼働中</span>;
      case 'SUSPENDED':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">停止中</span>;
      case 'PENDING':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">保留</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <Star size={16} className="text-yellow-500 fill-current" />
        <span className="font-bold text-gray-900">{(rating || 0).toFixed(1)}</span>
      </div>
    );
  };

  return (
    <SimpleLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">セラピスト管理</h1>
            <p className="text-gray-600">セラピストの審査・管理・評価を行います</p>
          </div>
          <button
            onClick={fetchTherapists}
            disabled={loading}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            更新
          </button>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">総セラピスト数</p>
            <p className="text-3xl font-bold text-gray-900">{therapists.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">承認済</p>
            <p className="text-3xl font-bold text-green-600">{therapists.filter(t => t.approval_status === 'APPROVED').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">審査待ち</p>
            <p className="text-3xl font-bold text-yellow-600">{therapists.filter(t => t.approval_status === 'PENDING').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">平均評価</p>
            <div className="flex items-center gap-2">
              <Star size={24} className="text-yellow-500 fill-current" />
              <p className="text-3xl font-bold text-gray-900">
                {(therapists.filter(t => t.rating > 0).reduce((sum, t) => sum + t.rating, 0) / therapists.filter(t => t.rating > 0).length || 0).toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 検索 */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="氏名、メール、専門分野で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* 承認ステータスフィルター */}
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">すべて</option>
              <option value="APPROVED">承認済</option>
              <option value="PENDING">審査中</option>
              <option value="REJECTED">却下</option>
            </select>

            {/* 評価フィルター */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">すべての評価</option>
              <option value="4.5">★4.5以上</option>
              <option value="4.0">★4.0以上</option>
              <option value="3.5">★3.5以上</option>
              <option value="3.0">★3.0以上</option>
            </select>

            {/* CSV出力 */}
            <button
              onClick={handleExportCSV}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
            >
              <Download size={20} />
              CSV出力
            </button>
          </div>
        </div>

        {/* 一括操作バー */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-bold text-blue-900">{selectedTherapists.length}件選択中</span>
              <button
                onClick={() => {
                  setSelectedTherapists([]);
                  setShowBulkActions(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-bold"
              >
                選択解除
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('承認')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700"
              >
                一括承認
              </button>
              <button
                onClick={() => handleBulkAction('却下')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700"
              >
                一括却下
              </button>
              <button
                onClick={() => handleBulkAction('メール送信')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
              >
                メール送信
              </button>
            </div>
          </div>
        )}

        {/* セラピスト一覧テーブル */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTherapists.length === filteredTherapists.length && filteredTherapists.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">セラピスト</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">専門・資格</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">評価</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">セッション数</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">審査ステータス</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">稼働状況</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTherapists.map((therapist) => (
                  <tr key={therapist.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTherapists.includes(therapist.id)}
                        onChange={() => handleSelectTherapist(therapist.id)}
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                          {therapist.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{therapist.name}</p>
                          <p className="text-xs text-gray-500">{therapist.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(therapist.specialties) && therapist.specialties.map((spec, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                              {spec}
                            </span>
                          ))}
                        </div>
                        {Array.isArray(therapist.certifications) && therapist.certifications.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Award size={12} />
                            {therapist.certifications.join(', ')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {therapist.rating > 0 ? renderRating(therapist.rating) : <span className="text-sm text-gray-400">未評価</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-teal-600" />
                        <span className="font-bold text-gray-900">{therapist.total_sessions || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getApprovalBadge(therapist.approval_status)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(therapist.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {therapist.approval_status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(therapist.id)}
                              className="text-green-600 hover:text-green-700 font-bold text-sm"
                            >
                              承認
                            </button>
                            <button
                              onClick={() => handleReject(therapist.id)}
                              className="text-red-600 hover:text-red-700 font-bold text-sm"
                            >
                              却下
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => navigate(`/admin/therapists/${therapist.id}`)}
                          className="text-teal-600 hover:text-teal-700 font-bold text-sm flex items-center gap-1"
                        >
                          <Eye size={16} />
                          詳細
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTherapists.length === 0 && (
            <div className="p-12 text-center">
              <UserCheck size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-bold">セラピストが見つかりません</p>
            </div>
          )}
        </div>
      </div>
    </SimpleLayout>
  );
};

export default TherapistManagement;
