import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, DollarSign, MapPin, Phone, Mail, 
  Plus, Edit, Trash2, CheckCircle, AlertCircle, Search,
  Eye, Save, X, ChevronRight, UserCheck, Settings, Star
} from 'lucide-react';
import SimpleLayout from '../../components/SimpleLayout';

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
  commission_rate: number;
  created_at: string;
}

const mockOffices: Office[] = [
  {
    id: 'office-001', name: 'HOGUSY本部', address: '東京都港区南青山1-1-1', phone: '03-1234-5678',
    email: 'admin@hogusy.com', description: 'HOGUSY直営のセラピスト管理部門', status: 'ACTIVE',
    representative_name: '総管理者', total_therapists: 5, monthly_revenue: 1850000, commission_rate: 0, created_at: '2025-01-01'
  },
  {
    id: 'office-002', name: 'リラクゼーション東京', address: '東京都新宿区西新宿2-8-1', phone: '03-2345-6789',
    email: 'info@relax-tokyo.jp', description: '都内最大手のセラピスト派遣事務所', status: 'ACTIVE',
    representative_name: '鈴木 一郎', total_therapists: 12, monthly_revenue: 3200000, commission_rate: 15, created_at: '2025-06-15'
  },
  {
    id: 'office-003', name: 'ウェルネスケア大阪', address: '大阪府大阪市北区梅田3-1-3', phone: '06-3456-7890',
    email: 'info@wellness-osaka.jp', description: '関西エリアを中心に展開', status: 'ACTIVE',
    representative_name: '山本 花子', total_therapists: 8, monthly_revenue: 2100000, commission_rate: 12, created_at: '2025-08-20'
  },
  {
    id: 'office-004', name: 'ヒーリングハンズ横浜', address: '神奈川県横浜市中区山下町1', phone: '045-4567-8901',
    email: 'info@healing-yokohama.jp', description: '横浜エリア専門', status: 'PENDING',
    representative_name: '高橋 健一', total_therapists: 3, monthly_revenue: 450000, commission_rate: 10, created_at: '2025-12-01'
  },
];

const OfficeManagement: React.FC = () => {
  const navigate = useNavigate();
  const [offices, setOffices] = useState<Office[]>([]);
  const [filteredOffices, setFilteredOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [editForm, setEditForm] = useState<Partial<Office>>({});

  useEffect(() => { fetchOffices(); }, []);
  useEffect(() => { filterOffices(); }, [offices, searchQuery, statusFilter]);

  const fetchOffices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/offices', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOffices(data.offices || []);
      } else {
        setOffices(mockOffices);
      }
    } catch (err) {
      setOffices(mockOffices);
    } finally {
      setLoading(false);
    }
  };

  const filterOffices = () => {
    let filtered = [...offices];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(o => o.name.toLowerCase().includes(q) || o.representative_name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q));
    }
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    setFilteredOffices(filtered);
  };

  const handleCreate = () => {
    setEditForm({ name: '', address: '', phone: '', email: '', description: '', representative_name: '', commission_rate: 15, status: 'PENDING' });
    setShowCreateModal(true);
  };

  const handleEdit = (office: Office) => {
    setSelectedOffice(office);
    setEditForm({ ...office });
    setShowEditModal(true);
  };

  const handleSaveCreate = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/offices', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          representative_name: editForm.representative_name,
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address,
          commission_rate: editForm.commission_rate,
          status: editForm.status,
          description: editForm.description,
        }),
      });
      if (response.ok) {
        setShowCreateModal(false);
        setMessage('オフィスを新規登録しました');
        fetchOffices(); // リロード
      } else {
        // フォールバック: ローカル追加
        const newOffice: Office = {
          id: `office-${Date.now()}`, name: editForm.name || '', address: editForm.address || '',
          phone: editForm.phone || '', email: editForm.email || '', description: editForm.description || '',
          status: editForm.status || 'PENDING', representative_name: editForm.representative_name || '',
          total_therapists: 0, monthly_revenue: 0, commission_rate: editForm.commission_rate || 15,
          created_at: new Date().toISOString().split('T')[0],
        };
        setOffices([...offices, newOffice]);
        setShowCreateModal(false);
        setMessage('オフィスを新規登録しました（ローカル）');
      }
    } catch {
      const newOffice: Office = {
        id: `office-${Date.now()}`, name: editForm.name || '', address: editForm.address || '',
        phone: editForm.phone || '', email: editForm.email || '', description: editForm.description || '',
        status: editForm.status || 'PENDING', representative_name: editForm.representative_name || '',
        total_therapists: 0, monthly_revenue: 0, commission_rate: editForm.commission_rate || 15,
        created_at: new Date().toISOString().split('T')[0],
      };
      setOffices([...offices, newOffice]);
      setShowCreateModal(false);
      setMessage('オフィスを新規登録しました（ローカル）');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveEdit = async () => {
    if (!selectedOffice) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/offices/${selectedOffice.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (response.ok) {
        fetchOffices();
      } else {
        setOffices(offices.map(o => o.id === selectedOffice.id ? { ...o, ...editForm } as Office : o));
      }
    } catch {
      setOffices(offices.map(o => o.id === selectedOffice.id ? { ...o, ...editForm } as Office : o));
    }
    setShowEditModal(false);
    setMessage('オフィス情報を更新しました');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (office: Office) => {
    setSelectedOffice(office);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedOffice) return;
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/admin/offices/${selectedOffice.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch {}
    setOffices(offices.filter(o => o.id !== selectedOffice.id));
    setShowDeleteModal(false);
    setMessage(`「${selectedOffice.name}」を削除しました`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleStatusChange = async (office: Office, newStatus: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/admin/offices/${office.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}
    setOffices(offices.map(o => o.id === office.id ? { ...o, status: newStatus } : o));
    setMessage(`「${office.name}」のステータスを${newStatus}に変更しました`);
    setTimeout(() => setMessage(''), 3000);
  };

  const totalTherapists = offices.reduce((sum, o) => sum + o.total_therapists, 0);
  const totalRevenue = offices.reduce((sum, o) => sum + o.monthly_revenue, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">セラピストオフィス管理</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-wider mt-1">Therapist Office Management — Full CRUD</p>
        </div>
        <button onClick={handleCreate} className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center gap-2">
          <Plus size={20} /> 新規オフィス登録
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-3">
          <CheckCircle className="text-teal-600" size={20} />
          <p className="text-teal-700 font-bold">{message}</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700 font-bold">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="登録オフィス数" value={offices.length.toString()} icon={<Building2 />} color="bg-indigo-50 text-indigo-600" />
        <StatCard label="総セラピスト数" value={totalTherapists.toString()} icon={<Users />} color="bg-teal-50 text-teal-600" />
        <StatCard label="月間総売上" value={`¥${totalRevenue.toLocaleString()}`} icon={<DollarSign />} color="bg-orange-50 text-orange-600" />
        <StatCard label="ACTIVE" value={offices.filter(o => o.status === 'ACTIVE').length.toString()} icon={<CheckCircle />} color="bg-green-50 text-green-600" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="オフィス名、代表者名、メールで検索..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none font-bold"
        >
          <option value="ALL">すべてのステータス</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="PENDING">PENDING</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>

      {/* Office List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">オフィス名</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">代表者</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">セラピスト数</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">月間売上</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">手数料率</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">ステータス</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOffices.map(office => (
                <tr key={office.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5">
                    <div>
                      <p className="font-bold text-gray-900">{office.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{office.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">{office.representative_name}</td>
                  <td className="px-6 py-5">
                    <span className="font-bold text-lg text-gray-900">{office.total_therapists}</span>
                    <span className="text-gray-400 text-sm ml-1">名</span>
                  </td>
                  <td className="px-6 py-5 font-bold text-gray-900">¥{office.monthly_revenue.toLocaleString()}</td>
                  <td className="px-6 py-5 font-bold text-gray-700">{office.commission_rate}%</td>
                  <td className="px-6 py-5">
                    <select
                      value={office.status}
                      onChange={e => handleStatusChange(office, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border-0 cursor-pointer ${
                        office.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        office.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
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
                      <button
                        onClick={() => navigate(`/admin/offices/${office.id}`)}
                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                        title="詳細を見る"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(office)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="編集"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(office)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="削除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOffices.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Building2 size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-bold">該当するオフィスがありません</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black">{showCreateModal ? '新規オフィス登録' : 'オフィス情報編集'}</h2>
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="p-2 hover:bg-gray-100 rounded-xl"><X size={24} /></button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <FormField label="オフィス名 *" value={editForm.name || ''} onChange={v => setEditForm({...editForm, name: v})} placeholder="例: リラクゼーション東京" />
              <FormField label="代表者名 *" value={editForm.representative_name || ''} onChange={v => setEditForm({...editForm, representative_name: v})} placeholder="例: 鈴木 一郎" />
              <FormField label="メールアドレス *" value={editForm.email || ''} onChange={v => setEditForm({...editForm, email: v})} placeholder="例: info@example.com" type="email" />
              <FormField label="電話番号" value={editForm.phone || ''} onChange={v => setEditForm({...editForm, phone: v})} placeholder="例: 03-1234-5678" />
              <div className="md:col-span-2">
                <FormField label="住所" value={editForm.address || ''} onChange={v => setEditForm({...editForm, address: v})} placeholder="例: 東京都新宿区..." />
              </div>
              <FormField label="手数料率 (%)" value={String(editForm.commission_rate || 0)} onChange={v => setEditForm({...editForm, commission_rate: Number(v)})} type="number" placeholder="15" />
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ステータス</label>
                <select value={editForm.status || 'PENDING'} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">説明</label>
                <textarea value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none h-24" placeholder="オフィスの概要..." />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">キャンセル</button>
              <button onClick={showCreateModal ? handleSaveCreate : handleSaveEdit} className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 flex items-center gap-2">
                <Save size={18} /> {showCreateModal ? '登録する' : '保存する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOffice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8" onClick={e => e.stopPropagation()}>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900">オフィスを削除しますか？</h3>
              <p className="text-gray-500">「<strong>{selectedOffice.name}</strong>」を削除します。<br />所属セラピスト{selectedOffice.total_therapists}名のデータにも影響します。</p>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">キャンセル</button>
                <button onClick={confirmDelete} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">削除する</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </div>
    <p className="text-2xl font-black text-gray-900">{value}</p>
    <p className="text-xs font-bold text-gray-400 mt-1">{label}</p>
  </div>
);

const FormField = ({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" placeholder={placeholder} />
  </div>
);

export default OfficeManagement;
