import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, DollarSign, MapPin, Phone, Mail, 
  FileText, Save, Plus, Edit, Trash2, CheckCircle, 
  AlertCircle, XCircle, Search, Filter, Download
} from 'lucide-react';

interface Office {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  status: string;
  representative_name: string;
  total_therapists: number;
  monthly_revenue: number;
}

interface Therapist {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  therapist_profile_id: string;
  status: string;
  commission_rate: number;
  office_commission_rate: number;
  rating: number;
  review_count: number;
}

const OfficeManagement: React.FC = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTherapistModal, setShowTherapistModal] = useState(false);

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/office-management', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOffices(data.offices || []);
      }
    } catch (err) {
      console.error('事務所取得エラー:', err);
    }
  };

  const fetchOfficeTherapists = async (officeId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/office-management/${officeId}/therapists`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTherapists(data.therapists || []);
      }
    } catch (err) {
      console.error('セラピスト取得エラー:', err);
    }
  };

  const handleSelectOffice = (office: Office) => {
    setSelectedOffice(office);
    fetchOfficeTherapists(office.id);
  };

  const handleApproveTherapist = async (therapistId: string) => {
    if (!selectedOffice) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `/api/office-management/${selectedOffice.id}/therapists/${therapistId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setMessage('セラピストを承認しました');
        fetchOfficeTherapists(selectedOffice.id);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError('承認に失敗しました');
    }
  };

  const handleRejectTherapist = async (therapistId: string) => {
    if (!selectedOffice) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `/api/office-management/${selectedOffice.id}/therapists/${therapistId}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setMessage('セラピストを却下しました');
        fetchOfficeTherapists(selectedOffice.id);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError('却下に失敗しました');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">
            事務所管理
          </h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">
            Office Management System
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          新規事務所登録
        </button>
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
        {/* 事務所一覧 */}
        <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={24} />
            登録事務所一覧
          </h2>

          <div className="space-y-3">
            {offices.map((office) => (
              <button
                key={office.id}
                onClick={() => handleSelectOffice(office)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedOffice?.id === office.id
                    ? 'bg-teal-50 border-2 border-teal-500'
                    : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{office.name}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      office.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {office.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {office.total_therapists || 0}名
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign size={14} />
                    ¥{(office.monthly_revenue || 0).toLocaleString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 事務所詳細とセラピスト一覧 */}
        <div className="lg:col-span-2">
          {selectedOffice ? (
            <div className="space-y-6">
              {/* 事務所詳細 */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {selectedOffice.name}
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      代表者名
                    </label>
                    <p className="text-gray-900">{selectedOffice.representative_name || '未設定'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      電話番号
                    </label>
                    <p className="text-gray-900">{selectedOffice.phone || '未設定'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      メールアドレス
                    </label>
                    <p className="text-gray-900">{selectedOffice.email || '未設定'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      所属セラピスト数
                    </label>
                    <p className="text-gray-900 font-bold text-2xl">
                      {selectedOffice.total_therapists || 0}名
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      住所
                    </label>
                    <p className="text-gray-900">{selectedOffice.address || '未設定'}</p>
                  </div>
                </div>
              </div>

              {/* 所属セラピスト一覧 */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">所属セラピスト</h2>
                  <button
                    onClick={() => setShowTherapistModal(true)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    セラピスト追加
                  </button>
                </div>

                <div className="space-y-4">
                  {therapists.map((therapist) => (
                    <div
                      key={therapist.user_id}
                      className="p-6 border border-gray-200 rounded-2xl"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <img
                            src={therapist.avatar_url || '/placeholder-therapist.jpg'}
                            alt={therapist.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {therapist.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {therapist.email}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">
                                セラピスト取り分: {therapist.commission_rate}%
                              </span>
                              <span className="text-gray-600">
                                事務所取り分: {therapist.office_commission_rate}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              therapist.status === 'APPROVED'
                                ? 'bg-green-100 text-green-700'
                                : therapist.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {therapist.status}
                          </span>

                          {therapist.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveTherapist(therapist.therapist_profile_id)}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700"
                              >
                                承認
                              </button>
                              <button
                                onClick={() => handleRejectTherapist(therapist.therapist_profile_id)}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
                              >
                                却下
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {therapists.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      所属セラピストがいません
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
              <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-400 font-bold">
                左側から事務所を選択してください
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficeManagement;
