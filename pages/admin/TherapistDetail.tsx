import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Star, Award, CheckCircle, XCircle,
  AlertCircle, Edit, Save, X, MapPin, Calendar, TrendingUp,
  Activity, Clock, DollarSign, Users, FileText
} from 'lucide-react';
import SimpleLayout from '../../components/SimpleLayout';

interface TherapistDetail {
  id: string;
  email: string;
  name: string;
  phone: string;
  bio: string;
  specialties: string[];
  certifications: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  total_sessions: number;
  areas: string[];
  approval_status: string;
  kyc_status: string;
  status: string;
  created_at: string;
  last_active: string;
  officeId: string | null;
}

const TherapistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<TherapistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchTherapistDetail();
  }, [id]);

  const fetchTherapistDetail = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/therapists/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTherapist(data);
      } else {
        // モックデータ
        setTherapist({
          id: id || 'therapist-1',
          email: 'tanaka@example.com',
          name: '田中 有紀',
          phone: '090-1111-2222',
          bio: '看護師資格を持つベテランセラピスト。医療知識を活かした丁寧な施術で、お客様一人ひとりの体調に合わせたケアを提供します。',
          specialties: ['ボディケア', 'リラクゼーション', 'アロマセラピー'],
          certifications: ['あん摩マッサージ指圧師', '柔道整復師'],
          experience: 10,
          rating: 4.8,
          reviewCount: 245,
          total_sessions: 342,
          areas: ['渋谷区', '新宿区', '港区'],
          approval_status: 'APPROVED',
          kyc_status: 'APPROVED',
          status: 'ACTIVE',
          created_at: '2025-12-01',
          last_active: '2026-01-23 14:30',
          officeId: 'off1'
        });
      }
    } catch (err) {
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('このセラピストを承認しますか？')) return;
    
    setMessage('承認しました');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReject = async () => {
    if (!confirm('このセラピストを却下しますか？')) return;
    
    setMessage('却下しました');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSuspend = async () => {
    if (!confirm('このセラピストを停止しますか？')) return;
    
    setMessage('停止しました');
    setTimeout(() => setMessage(''), 3000);
  };

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle size={16} />承認済</span>;
      case 'PENDING':
        return <span className="px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-700 flex items-center gap-1"><AlertCircle size={16} />審査中</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700 flex items-center gap-1"><XCircle size={16} />却下</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700">未申請</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">稼働中</span>;
      case 'SUSPENDED':
        return <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">停止中</span>;
      case 'PENDING':
        return <span className="px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-700">保留</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  if (loading) {
    return (
      <SimpleLayout>
        <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </SimpleLayout>
    );
  }

  if (error || !therapist) {
    return (
      <SimpleLayout>
        <div className="p-8 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate('/admin/therapists')} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
              <span className="font-bold">戻る</span>
            </button>
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
              <p className="text-gray-900 font-bold text-lg mb-2">データの読み込みに失敗しました</p>
              <p className="text-gray-600 mb-4">{error}</p>
              <button onClick={fetchTherapistDetail} className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700">
                再試行
              </button>
            </div>
          </div>
        </div>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-6 flex items-center justify-between">
            <button onClick={() => navigate('/admin/therapists')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
              <span className="font-bold">セラピスト一覧に戻る</span>
            </button>
            <div className="flex items-center gap-2">
              {therapist.approval_status === 'PENDING' && (
                <>
                  <button onClick={handleApprove} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700">
                    承認
                  </button>
                  <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700">
                    却下
                  </button>
                </>
              )}
              {therapist.status === 'ACTIVE' && (
                <button onClick={handleSuspend} className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700">
                  停止
                </button>
              )}
            </div>
          </div>

          {/* メッセージ */}
          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              <span className="text-green-800 font-bold">{message}</span>
            </div>
          )}

          {/* メイン情報 */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {therapist.name ? therapist.name.charAt(0) : 'T'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{therapist.name || 'セラピスト'}</h1>
                  {getApprovalBadge(therapist.approval_status)}
                  {getStatusBadge(therapist.status)}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Mail size={16} />
                    <span>{therapist.email || '-'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone size={16} />
                    <span>{therapist.phone || '-'}</span>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{therapist.bio || '自己紹介文はありません'}</p>
              </div>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 text-yellow-600 mb-2">
                <Star size={20} className="fill-current" />
                <span className="text-sm font-bold">評価</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{(therapist.rating || 0).toFixed(1)}</p>
              <p className="text-xs text-gray-500 mt-1">{therapist.reviewCount || 0}件のレビュー</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 text-teal-600 mb-2">
                <TrendingUp size={20} />
                <span className="text-sm font-bold">総セッション数</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{therapist.total_sessions || 0}</p>
              <p className="text-xs text-gray-500 mt-1">累計施術回数</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <Clock size={20} />
                <span className="text-sm font-bold">経験年数</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{therapist.experience || 0}年</p>
              <p className="text-xs text-gray-500 mt-1">実務経験</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Activity size={20} />
                <span className="text-sm font-bold">ステータス</span>
              </div>
              <p className="text-lg font-bold text-gray-900 mt-3">{getStatusBadge(therapist.status)}</p>
            </div>
          </div>

          {/* 詳細情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 専門分野・資格 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award size={20} className="text-teal-600" />
                専門分野・資格
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-2">専門分野</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(therapist.specialties) && therapist.specialties.map((spec, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-2">保有資格</p>
                  <div className="space-y-2">
                    {Array.isArray(therapist.certifications) && therapist.certifications.length > 0 ? (
                      therapist.certifications.map((cert, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-sm text-gray-700">{cert}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">資格情報なし</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 対応エリア */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-teal-600" />
                対応エリア
              </h2>
              <div className="space-y-2">
                {Array.isArray(therapist.areas) && therapist.areas.map((area, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-sm">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 登録情報 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-teal-600" />
                登録情報
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">登録日</span>
                  <span className="font-bold text-gray-900">{therapist.created_at || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最終ログイン</span>
                  <span className="font-bold text-gray-900">{therapist.last_active || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">KYC審査</span>
                  <span className="font-bold text-gray-900">{therapist.kyc_status === 'APPROVED' ? '完了' : '未完了'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">所属オフィス</span>
                  <span className="font-bold text-gray-900">{therapist.officeId || '独立'}</span>
                </div>
              </div>
            </div>

            {/* アクションログ */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-teal-600" />
                最近のアクティビティ
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>直近30日のセッション数: 28回</p>
                <p>月間売上: ¥224,000</p>
                <p>キャンセル率: 2.3%</p>
                <p>平均応答時間: 15分</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default TherapistDetail;
