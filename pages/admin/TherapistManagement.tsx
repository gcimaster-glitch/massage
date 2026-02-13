import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCheck, Search, Download, RefreshCw, CheckCircle, XCircle,
  AlertCircle, Star, Award, TrendingUp, Eye, Mail, Phone, MapPin,
  Edit, Trash2, Plus, Save, X, Building2, Filter
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
  office_name: string;
  office_id: string;
  commission_rate: number;
  created_at: string;
  last_active: string;
}

const mockTherapists: Therapist[] = [
  { id: 'th-001', email: 'misaki@hogusy.com', name: '田中 美咲', phone: '090-1234-5678', specialties: ['タイ古式', 'アロマ'], certifications: ['あん摩マッサージ指圧師'], rating: 4.9, total_sessions: 456, approval_status: 'APPROVED', kyc_status: 'VERIFIED', status: 'ACTIVE', office_name: 'HOGUSY本部', office_id: 'office-001', commission_rate: 65, created_at: '2025-07-01', last_active: '2026-02-12' },
  { id: 'th-002', email: 'yuki@hogusy.com', name: '鈴木 有紀', phone: '090-2345-6789', specialties: ['整体', '骨盤矯正'], certifications: ['柔道整復師'], rating: 4.8, total_sessions: 389, approval_status: 'APPROVED', kyc_status: 'VERIFIED', status: 'ACTIVE', office_name: 'HOGUSY本部', office_id: 'office-001', commission_rate: 70, created_at: '2025-07-15', last_active: '2026-02-13' },
  { id: 'th-003', email: 'kenta@relax-tokyo.jp', name: '佐藤 健太', phone: '090-3456-7890', specialties: ['指圧', '整体'], certifications: [], rating: 4.7, total_sessions: 312, approval_status: 'APPROVED', kyc_status: 'VERIFIED', status: 'ACTIVE', office_name: 'リラクゼーション東京', office_id: 'office-002', commission_rate: 65, created_at: '2025-08-01', last_active: '2026-02-11' },
  { id: 'th-004', email: 'ai@relax-tokyo.jp', name: '高橋 愛', phone: '090-4567-8901', specialties: ['リンパ'], certifications: [], rating: 4.5, total_sessions: 178, approval_status: 'APPROVED', kyc_status: 'VERIFIED', status: 'ACTIVE', office_name: 'リラクゼーション東京', office_id: 'office-002', commission_rate: 65, created_at: '2025-09-01', last_active: '2026-02-10' },
  { id: 'th-005', email: 'taro@wellness-osaka.jp', name: '山本 太郎', phone: '090-5678-9012', specialties: ['もみほぐし', 'ヘッドスパ'], certifications: [], rating: 4.6, total_sessions: 234, approval_status: 'APPROVED', kyc_status: 'VERIFIED', status: 'ACTIVE', office_name: 'ウェルネスケア大阪', office_id: 'office-003', commission_rate: 65, created_at: '2025-09-15', last_active: '2026-02-12' },
  { id: 'th-006', email: 'hanako@healing.jp', name: '渡辺 花子', phone: '090-6789-0123', specialties: ['アロマ'], certifications: [], rating: 0, total_sessions: 0, approval_status: 'PENDING', kyc_status: 'PENDING', status: 'PENDING', office_name: 'ヒーリングハンズ横浜', office_id: 'office-004', commission_rate: 60, created_at: '2026-02-01', last_active: '-' },
];

const TherapistManagement: React.FC = () => {
  const navigate = useNavigate();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

  useEffect(() => { fetchTherapists(); }, []);
  useEffect(() => { filterTherapists(); }, [therapists, searchQuery, statusFilter, officeFilter]);

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/therapists', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTherapists(data.therapists || []);
      } else {
        setTherapists(mockTherapists);
      }
    } catch {
      setTherapists(mockTherapists);
    } finally {
      setLoading(false);
    }
  };

  const filterTherapists = () => {
    let filtered = [...therapists];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.phone.includes(q));
    }
    if (statusFilter !== 'all') filtered = filtered.filter(t => t.status === statusFilter);
    if (officeFilter !== 'all') filtered = filtered.filter(t => t.office_id === officeFilter);
    setFilteredTherapists(filtered);
  };

  const handleStatusChange = (therapist: Therapist, newStatus: string) => {
    setTherapists(therapists.map(t => t.id === therapist.id ? { ...t, status: newStatus } : t));
    setMessage(`${therapist.name}のステータスを${newStatus}に変更しました`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!selectedTherapist) return;
    setTherapists(therapists.filter(t => t.id !== selectedTherapist.id));
    setShowDeleteModal(false);
    setMessage(`${selectedTherapist.name}を削除しました`);
    setTimeout(() => setMessage(''), 3000);
  };

  const offices = [...new Map(therapists.map(t => [t.office_id, { id: t.office_id, name: t.office_name }])).values()];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">セラピスト管理</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-wider mt-1">All Therapists — Cross-Office CRUD</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchTherapists} className="px-4 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 flex items-center gap-2">
            <RefreshCw size={18} /> 更新
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-3">
          <CheckCircle className="text-teal-600" size={20} /><p className="text-teal-700 font-bold">{message}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="全セラピスト" value={therapists.length.toString()} color="bg-teal-50 text-teal-600" />
        <StatCard label="ACTIVE" value={therapists.filter(t => t.status === 'ACTIVE').length.toString()} color="bg-green-50 text-green-600" />
        <StatCard label="PENDING" value={therapists.filter(t => t.status === 'PENDING').length.toString()} color="bg-yellow-50 text-yellow-600" />
        <StatCard label="SUSPENDED" value={therapists.filter(t => t.status === 'SUSPENDED').length.toString()} color="bg-red-50 text-red-600" />
        <StatCard label="所属オフィス数" value={offices.length.toString()} color="bg-indigo-50 text-indigo-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text" placeholder="名前、メール、電話で検索..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
          />
        </div>
        <select value={officeFilter} onChange={e => setOfficeFilter(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-xl font-bold">
          <option value="all">すべてのオフィス</option>
          {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-xl font-bold">
          <option value="all">すべてのステータス</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="PENDING">PENDING</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>

      {/* Therapist Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">セラピスト</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">所属オフィス</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">評価</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">施術数</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">取り分</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">ステータス</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTherapists.map(therapist => (
                <tr key={therapist.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold">
                        {therapist.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{therapist.name}</p>
                        <p className="text-xs text-gray-400">{therapist.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <button
                      onClick={() => navigate(`/admin/offices/${therapist.office_id}`)}
                      className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-bold"
                    >
                      <Building2 size={14} /> {therapist.office_name}
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500" />
                      <span className="font-bold">{therapist.rating > 0 ? therapist.rating.toFixed(1) : '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-gray-700">{therapist.total_sessions}回</td>
                  <td className="px-6 py-5 font-bold text-gray-700">{therapist.commission_rate}%</td>
                  <td className="px-6 py-5">
                    <select
                      value={therapist.status}
                      onChange={e => handleStatusChange(therapist, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border-0 cursor-pointer ${
                        therapist.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        therapist.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PENDING">PENDING</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => navigate(`/admin/therapists/${therapist.id}`)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg" title="詳細"><Eye size={18} /></button>
                      <button onClick={() => handleDelete(therapist)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="削除"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTherapists.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <UserCheck size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-bold">該当するセラピストがいません</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedTherapist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8" onClick={e => e.stopPropagation()}>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto"><Trash2 className="text-red-600" size={32} /></div>
              <h3 className="text-xl font-black text-gray-900">セラピストを削除しますか？</h3>
              <p className="text-gray-500">「<strong>{selectedTherapist.name}</strong>」（{selectedTherapist.office_name}）を削除します。</p>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-6 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200">キャンセル</button>
                <button onClick={confirmDelete} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">削除する</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
    <p className="text-2xl font-black text-gray-900">{value}</p>
    <p className={`text-xs font-bold mt-1 ${color.replace('bg-', 'text-').replace('-50', '-600')}`}>{label}</p>
  </div>
);

export default TherapistManagement;
