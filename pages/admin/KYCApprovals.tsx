import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, User, Mail, Phone, Calendar, FileText, Loader2 } from 'lucide-react';

interface KYCApplication {
  doc_id: string;      // kyc_documents.id
  user_id: string;     // users.id（PATCH時に使用）
  id: string;          // 互換性のため（doc_idのエイリアス）
  email: string;
  name: string;
  phone: string | null;
  id_type: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  user_kyc_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  created_at: string;
}

const KYCApprovals: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<KYCApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<KYCApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/kyc/admin');
      if (res.ok) {
        const data = await res.json() as { applications?: KYCApplication[] };
        // バックエンドはdoc_idを返すため、idフィールドに統一
        const apps = (data.applications || []).map((a) => ({ ...a, id: a.doc_id }));
        setApplications(apps);
      }
    } catch (error) {
      console.error('Failed to fetch KYC applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedApplication) return;

    if (actionType === 'reject' && !reason.trim()) {
      alert('❌ 却下理由を入力してください');
      return;
    }

    try {
      setProcessing(true);
      // バックエンドはuser_idでPATCHを受け付ける
      const res = await fetch(`/api/kyc/admin/${selectedApplication.user_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionType === 'approve' ? 'VERIFIED' : 'REJECTED',
          reason: reason || undefined,
          doc_id: selectedApplication.doc_id,
        }),
      });

      if (res.ok) {
        alert(actionType === 'approve' ? '✅ 承認しました' : '❌ 却下しました');
        setShowModal(false);
        setSelectedApplication(null);
        setReason('');
        fetchApplications();
      } else {
        alert('❌ 処理に失敗しました');
      }
    } catch (error) {
      console.error('KYC action error:', error);
      alert('🌐 ネットワークエラーが発生しました');
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (application: KYCApplication, type: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setActionType(type);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="animate-spin text-teal-600 mx-auto" />
          <p className="text-gray-600 font-bold">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">KYC審査</h1>
          <p className="text-gray-600 font-bold">本人確認書類の審査を行います</p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-2 border-yellow-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center">
                <Clock size={28} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold">審査待ち</p>
                <p className="text-3xl font-black text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-green-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold">承認済み</p>
                <p className="text-3xl font-black text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-red-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                <XCircle size={28} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold">却下済み</p>
                <p className="text-3xl font-black text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* KYC申請一覧 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-black text-gray-900">審査待ち一覧</h2>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center">
              <Clock size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-bold">審査待ちの申請はありません</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map((app) => (
                <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <User size={32} />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-black text-gray-900">{app.name}</h3>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-black uppercase tracking-wider">
                            審査待ち
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 font-bold">
                            <Mail size={16} />
                            {app.email}
                          </div>
                          {app.phone && (
                            <div className="flex items-center gap-2 text-gray-600 font-bold">
                              <Phone size={16} />
                              {app.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-600 font-bold">
                            <Calendar size={16} />
                            {new Date(app.created_at).toLocaleDateString('ja-JP')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => openModal(app, 'approve')}
                        className="px-6 py-3 bg-green-500 text-white rounded-2xl font-black text-sm hover:bg-green-600 transition-all shadow-sm flex items-center gap-2"
                      >
                        <CheckCircle size={18} />
                        承認
                      </button>
                      <button
                        onClick={() => openModal(app, 'reject')}
                        className="px-6 py-3 bg-red-500 text-white rounded-2xl font-black text-sm hover:bg-red-600 transition-all shadow-sm flex items-center gap-2"
                      >
                        <XCircle size={18} />
                        却下
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 確認モーダル */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-gray-900 mb-4">
              {actionType === 'approve' ? '✅ KYC承認' : '❌ KYC却下'}
            </h3>
            <p className="text-gray-600 font-bold mb-6">
              {actionType === 'approve'
                ? `${selectedApplication.name}さんのKYCを承認しますか？`
                : `${selectedApplication.name}さんのKYCを却下しますか？`}
            </p>

            <div className="bg-gray-50 p-4 rounded-2xl mb-6 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User size={16} className="text-gray-500" />
                <span className="font-bold text-gray-900">{selectedApplication.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-gray-500" />
                <span className="font-bold text-gray-600">{selectedApplication.email}</span>
              </div>
            </div>

            {actionType === 'reject' && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">却下理由</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="却下理由を入力してください（例：書類が不鮮明、有効期限切れなど）"
                  className="w-full h-32 p-4 border-2 border-gray-200 rounded-2xl font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none resize-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setReason('');
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-900 rounded-2xl font-black hover:bg-gray-200 transition-all"
                disabled={processing}
              >
                キャンセル
              </button>
              <button
                onClick={handleAction}
                className={`flex-1 py-3 text-white rounded-2xl font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  actionType === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    処理中...
                  </>
                ) : (
                  <>
                    {actionType === 'approve' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    {actionType === 'approve' ? '承認する' : '却下する'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCApprovals;
