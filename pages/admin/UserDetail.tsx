import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Calendar, CheckCircle, XCircle,
  AlertCircle, Edit, Save, X, CreditCard, Shield, UserCheck,
  Link as LinkIcon, Building2, MapPin, Clock, Activity
} from 'lucide-react';

interface UserDetail {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  avatar_url: string;
  email_verified: number;
  phone_verified: number;
  kyc_status: string;
  kyc_verified_at: string | null;
  payment_registered: number;
  stripe_customer_id: string | null;
  affiliate_id: string | null;
  affiliate_name: string | null;
  registration_type: 'AFFILIATE' | 'FREE';
  therapist_office_id: string | null;
  therapist_office_name: string | null;
  therapist_type: 'OFFICE' | 'DIRECT' | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  booking_count: number;
  total_spent: number;
}

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserDetail>>({});

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setEditData(data.user);
      } else {
        setError('ユーザー情報の取得に失敗しました');
      }
    } catch (err) {
      setError('ユーザー情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        setMessage('ユーザー情報を更新しました');
        setIsEditing(false);
        fetchUserDetail();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('更新に失敗しました');
      }
    } catch (err) {
      setError('更新に失敗しました');
    }
  };

  const handleToggleVerification = async (field: 'email_verified' | 'phone_verified' | 'kyc_status') => {
    try {
      const token = localStorage.getItem('auth_token');
      const newValue = field === 'kyc_status' 
        ? (user?.kyc_status === 'APPROVED' ? 'PENDING' : 'APPROVED')
        : (user?.[field] ? 0 : 1);

      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: newValue }),
      });

      if (response.ok) {
        setMessage('認証状態を更新しました');
        fetchUserDetail();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('更新に失敗しました');
      }
    } catch (err) {
      setError('更新に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
          <p className="text-red-600 font-bold">ユーザーが見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/users')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-bold"
        >
          <ArrowLeft size={20} />
          一般ユーザー管理に戻る
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">
              ユーザー詳細
            </h1>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">
              User Detail & Management
            </p>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <Edit size={20} />
              編集
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData(user);
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <X size={20} />
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                <Save size={20} />
                保存
              </button>
            </div>
          )}
        </div>
      </div>

      {/* メッセージ表示 */}
      {message && (
        <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-3">
          <CheckCircle className="text-teal-600" size={20} />
          <p className="text-teal-600 font-bold">{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左カラム - 基本情報 */}
        <div className="lg:col-span-2 space-y-6">
          {/* プロフィールカード */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">基本情報</h2>
            
            <div className="flex items-start gap-6 mb-8">
              <img
                src={user.avatar_url || '/placeholder-user.jpg'}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
              />
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        名前
                      </label>
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        メールアドレス
                      </label>
                      <input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        電話番号
                      </label>
                      <input
                        type="tel"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-gray-900">{user.name}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={16} />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={16} />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        <span>登録日: {new Date(user.created_at).toLocaleDateString('ja-JP')}</span>
                      </div>
                      {user.last_login_at && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={16} />
                          <span>最終ログイン: {new Date(user.last_login_at).toLocaleDateString('ja-JP')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ロールバッジ */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                {user.role}
              </span>
            </div>
          </div>

          {/* 認証状態カード */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">認証状態</h2>
            
            <div className="space-y-4">
              {/* メール認証 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Mail size={20} className={user.email_verified ? 'text-green-600' : 'text-gray-400'} />
                  <div>
                    <p className="font-bold text-gray-900">メール認証</p>
                    <p className="text-sm text-gray-500">
                      {user.email_verified ? '認証済み' : '未認証'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleVerification('email_verified')}
                  className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                    user.email_verified
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {user.email_verified ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                </button>
              </div>

              {/* 電話番号認証 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Phone size={20} className={user.phone_verified ? 'text-green-600' : 'text-gray-400'} />
                  <div>
                    <p className="font-bold text-gray-900">電話番号認証</p>
                    <p className="text-sm text-gray-500">
                      {user.phone_verified ? '認証済み' : '未認証'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleVerification('phone_verified')}
                  className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                    user.phone_verified
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {user.phone_verified ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                </button>
              </div>

              {/* KYC認証 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Shield size={20} className={user.kyc_status === 'APPROVED' ? 'text-green-600' : 'text-gray-400'} />
                  <div>
                    <p className="font-bold text-gray-900">KYC認証（本人確認）</p>
                    <p className="text-sm text-gray-500">
                      {user.kyc_status === 'APPROVED' ? '承認済み' : 
                       user.kyc_status === 'PENDING' ? '審査中' : '未申請'}
                    </p>
                    {user.kyc_verified_at && (
                      <p className="text-xs text-gray-400">
                        認証日: {new Date(user.kyc_verified_at).toLocaleDateString('ja-JP')}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleToggleVerification('kyc_status')}
                  className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                    user.kyc_status === 'APPROVED'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  {user.kyc_status === 'APPROVED' ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                </button>
              </div>

              {/* 決済情報登録 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className={user.payment_registered ? 'text-green-600' : 'text-gray-400'} />
                  <div>
                    <p className="font-bold text-gray-900">決済情報登録</p>
                    <p className="text-sm text-gray-500">
                      {user.payment_registered ? '登録済み' : '未登録'}
                    </p>
                    {user.stripe_customer_id && (
                      <p className="text-xs text-gray-400 font-mono">
                        Stripe ID: {user.stripe_customer_id}
                      </p>
                    )}
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl font-bold ${
                  user.payment_registered
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {user.payment_registered ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 登録経路カード */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">登録経路</h2>
            
            <div className="space-y-4">
              {/* 登録タイプ */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <LinkIcon size={20} className={user.registration_type === 'AFFILIATE' ? 'text-purple-600' : 'text-gray-600'} />
                  <div>
                    <p className="font-bold text-gray-900">登録タイプ</p>
                    <p className="text-sm text-gray-500">
                      {user.registration_type === 'AFFILIATE' ? 'アフィリエイト経由' : 'フリー登録'}
                    </p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                  user.registration_type === 'AFFILIATE'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {user.registration_type === 'AFFILIATE' ? 'AFFILIATE' : 'FREE'}
                </span>
              </div>

              {/* アフィリエイト情報 */}
              {user.affiliate_id && (
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <div className="flex items-center gap-3">
                    <UserCheck size={20} className="text-purple-600" />
                    <div>
                      <p className="font-bold text-gray-900">アフィリエイトパートナー</p>
                      <p className="text-sm text-purple-600 font-bold">
                        {user.affiliate_name || user.affiliate_id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/affiliates/${user.affiliate_id}`)}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold hover:bg-purple-200 transition-colors"
                  >
                    詳細を見る
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右カラム - 統計情報 */}
        <div className="space-y-6">
          {/* 利用統計 */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-black text-gray-900 mb-6">利用統計</h2>
            
            <div className="space-y-4">
              <div className="text-center p-6 bg-teal-50 rounded-2xl">
                <p className="text-sm text-gray-600 font-bold mb-2">予約回数</p>
                <p className="text-4xl font-black text-teal-600">{user.booking_count}</p>
                <p className="text-xs text-gray-500 mt-1">回</p>
              </div>

              <div className="text-center p-6 bg-indigo-50 rounded-2xl">
                <p className="text-sm text-gray-600 font-bold mb-2">総利用金額</p>
                <p className="text-4xl font-black text-indigo-600">
                  ¥{user.total_spent.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">円</p>
              </div>
            </div>
          </div>

          {/* クイックアクション */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-black text-gray-900 mb-6">クイックアクション</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/admin/bookings?user_id=${user.id}`)}
                className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <span>予約履歴を見る</span>
                <Calendar size={18} />
              </button>

              <button
                onClick={() => navigate(`/admin/payments?user_id=${user.id}`)}
                className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <span>決済履歴を見る</span>
                <CreditCard size={18} />
              </button>

              <button
                onClick={() => navigate(`/admin/activity?user_id=${user.id}`)}
                className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <span>アクティビティログ</span>
                <Activity size={18} />
              </button>
            </div>
          </div>

          {/* 危険操作 */}
          <div className="bg-red-50 rounded-3xl border border-red-200 p-6">
            <h2 className="text-xl font-black text-red-900 mb-4">危険操作</h2>
            <p className="text-sm text-red-600 mb-4">
              以下の操作は取り消すことができません
            </p>
            <button
              onClick={() => {
                if (confirm(`${user.name}を削除してもよろしいですか？この操作は取り消せません。`)) {
                  // Delete user logic here
                }
              }}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
            >
              ユーザーを削除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
