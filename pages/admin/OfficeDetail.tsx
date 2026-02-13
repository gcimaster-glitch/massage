import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, Activity, JapaneseYen, ShieldAlert, 
  Edit, Save, X, Plus, Trash2, CheckCircle, AlertCircle,
  Mail, Phone, MapPin, Star, Calendar, Eye, Building2,
  UserCheck, Settings, ChevronRight
} from 'lucide-react';

interface OfficeInfo {
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

interface OfficeTherapist {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  status: string;
  rating: number;
  review_count: number;
  total_sessions: number;
  specialties: string[];
  commission_rate: number;
  created_at: string;
}

const mockOfficeData: OfficeInfo = {
  id: 'office-002', name: 'リラクゼーション東京', address: '東京都新宿区西新宿2-8-1',
  phone: '03-2345-6789', email: 'info@relax-tokyo.jp', description: '都内最大手のセラピスト派遣事務所',
  status: 'ACTIVE', representative_name: '鈴木 一郎', total_therapists: 4,
  monthly_revenue: 3200000, commission_rate: 15, created_at: '2025-06-15',
};

const mockTherapists: OfficeTherapist[] = [
  { id: 'th-001', name: '田中 美咲', email: 'misaki@relax-tokyo.jp', phone: '090-1234-5678', avatar_url: '', status: 'ACTIVE', rating: 4.9, review_count: 128, total_sessions: 456, specialties: ['タイ古式', 'アロマ'], commission_rate: 65, created_at: '2025-07-01' },
  { id: 'th-002', name: '佐藤 健太', email: 'kenta@relax-tokyo.jp', phone: '090-2345-6789', avatar_url: '', status: 'ACTIVE', rating: 4.7, review_count: 89, total_sessions: 312, specialties: ['指圧', '整体'], commission_rate: 65, created_at: '2025-07-15' },
  { id: 'th-003', name: '高橋 愛', email: 'ai@relax-tokyo.jp', phone: '090-3456-7890', avatar_url: '', status: 'PENDING', rating: 0, review_count: 0, total_sessions: 0, specialties: ['リンパ'], commission_rate: 60, created_at: '2026-01-20' },
  { id: 'th-004', name: '渡辺 健一', email: 'kenichi@relax-tokyo.jp', phone: '090-4567-8901', avatar_url: '', status: 'SUSPENDED', rating: 3.2, review_count: 15, total_sessions: 45, specialties: ['もみほぐし'], commission_rate: 65, created_at: '2025-09-01' },
];

const AdminOfficeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [office, setOffice] = useState<OfficeInfo | null>(null);
  const [therapists, setTherapists] = useState<OfficeTherapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<OfficeInfo>>({});
  const [message, setMessage] = useState('');
  const [showAddTherapist, setShowAddTherapist] = useState(false);
  const [newTherapist, setNewTherapist] = useState({ name: '', email: '', phone: '', commission_rate: 65 });

  useEffect(() => { fetchOfficeDetail(); }, [id]);

  const fetchOfficeDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/offices/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOffice(data.office);
        setTherapists(data.therapists || []);
      } else {
        setOffice(mockOfficeData);
        setTherapists(mockTherapists);
      }
    } catch {
      setOffice(mockOfficeData);
      setTherapists(mockTherapists);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = () => {
    if (office) {
      setEditForm({ ...office });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!office) return;
    setOffice({ ...office, ...editForm } as OfficeInfo);
    setIsEditing(false);
    setMessage('オフィス情報を保存しました');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleTherapistStatus = (therapistId: string, newStatus: string) => {
    setTherapists(therapists.map(t => t.id === therapistId ? { ...t, status: newStatus } : t));
    setMessage(`セラピストのステータスを${newStatus}に変更しました`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleRemoveTherapist = (therapistId: string) => {
    if (!confirm('このセラピストをオフィスから除外しますか？')) return;
    setTherapists(therapists.filter(t => t.id !== therapistId));
    setMessage('セラピストをオフィスから除外しました');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddTherapist = () => {
    const newTh: OfficeTherapist = {
      id: `th-${Date.now()}`, name: newTherapist.name, email: newTherapist.email,
      phone: newTherapist.phone, avatar_url: '', status: 'PENDING', rating: 0,
      review_count: 0, total_sessions: 0, specialties: [],
      commission_rate: newTherapist.commission_rate, created_at: new Date().toISOString().split('T')[0],
    };
    setTherapists([...therapists, newTh]);
    setShowAddTherapist(false);
    setNewTherapist({ name: '', email: '', phone: '', commission_rate: 65 });
    setMessage('セラピストを追加しました');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading || !office) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/offices')} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">{office.name}</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Office Detail — Full CRUD Access</p>
        </div>
        {!isEditing ? (
          <button onClick={handleStartEdit} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">
            <Edit size={18} /> 編集
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="px-4 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200"><X size={18} /></button>
            <button onClick={handleSaveEdit} className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 flex items-center gap-2"><Save size={18} /> 保存</button>
          </div>
        )}
      </div>

      {message && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-3">
          <CheckCircle className="text-teal-600" size={20} /><p className="text-teal-700 font-bold">{message}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '所属セラピスト', val: therapists.length, unit: '名', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
          { label: '月間売上', val: `¥${office.monthly_revenue.toLocaleString()}`, unit: '', icon: JapaneseYen, color: 'bg-teal-50 text-teal-600' },
          { label: '手数料率', val: office.commission_rate, unit: '%', icon: Activity, color: 'bg-orange-50 text-orange-600' },
          { label: 'ステータス', val: office.status, unit: '', icon: CheckCircle, color: 'bg-green-50 text-green-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-black text-gray-900">{stat.val}<span className="text-xs ml-1 font-bold text-gray-400">{stat.unit}</span></p>
            <p className="text-xs font-bold text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Office Information */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><Building2 size={24} /> オフィス情報</h2>
        {isEditing ? (
          <div className="grid md:grid-cols-2 gap-6">
            <EditField label="オフィス名" value={editForm.name || ''} onChange={v => setEditForm({...editForm, name: v})} />
            <EditField label="代表者名" value={editForm.representative_name || ''} onChange={v => setEditForm({...editForm, representative_name: v})} />
            <EditField label="メールアドレス" value={editForm.email || ''} onChange={v => setEditForm({...editForm, email: v})} />
            <EditField label="電話番号" value={editForm.phone || ''} onChange={v => setEditForm({...editForm, phone: v})} />
            <div className="md:col-span-2">
              <EditField label="住所" value={editForm.address || ''} onChange={v => setEditForm({...editForm, address: v})} />
            </div>
            <EditField label="手数料率 (%)" value={String(editForm.commission_rate || 0)} onChange={v => setEditForm({...editForm, commission_rate: Number(v)})} type="number" />
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ステータス</label>
              <select value={editForm.status || 'ACTIVE'} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold">
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">説明</label>
              <textarea value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none h-24" />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <InfoRow label="代表者名" value={office.representative_name} icon={<UserCheck size={16} />} />
            <InfoRow label="メールアドレス" value={office.email} icon={<Mail size={16} />} />
            <InfoRow label="電話番号" value={office.phone} icon={<Phone size={16} />} />
            <InfoRow label="住所" value={office.address} icon={<MapPin size={16} />} />
            <InfoRow label="手数料率" value={`${office.commission_rate}%`} icon={<Activity size={16} />} />
            <InfoRow label="登録日" value={office.created_at} icon={<Calendar size={16} />} />
            <div className="md:col-span-2">
              <InfoRow label="説明" value={office.description || '未設定'} icon={<Building2 size={16} />} />
            </div>
          </div>
        )}
      </div>

      {/* Therapist List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2"><Users size={24} /> 所属セラピスト一覧</h2>
          <button onClick={() => setShowAddTherapist(true)} className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 flex items-center gap-2">
            <Plus size={18} /> セラピスト追加
          </button>
        </div>

        <div className="space-y-4">
          {therapists.map(therapist => (
            <div key={therapist.id} className="p-6 border border-gray-100 rounded-2xl hover:border-gray-200 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 items-start">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                    {therapist.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{therapist.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Mail size={12} />{therapist.email}</span>
                      <span className="flex items-center gap-1"><Phone size={12} />{therapist.phone}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-sm"><Star size={14} className="text-yellow-500" />{therapist.rating > 0 ? therapist.rating.toFixed(1) : '-'}</span>
                      <span className="text-xs text-gray-400">レビュー {therapist.review_count}件</span>
                      <span className="text-xs text-gray-400">施術 {therapist.total_sessions}回</span>
                      <span className="text-xs text-gray-400">取り分 {therapist.commission_rate}%</span>
                    </div>
                    {therapist.specialties.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {therapist.specialties.map(s => (
                          <span key={s} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={therapist.status}
                    onChange={e => handleTherapistStatus(therapist.id, e.target.value)}
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
                  <button onClick={() => navigate(`/admin/therapists/${therapist.id}`)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg" title="詳細">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => handleRemoveTherapist(therapist.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="除外">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {therapists.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-bold">所属セラピストがいません</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Therapist Modal */}
      {showAddTherapist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddTherapist(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-gray-900 mb-6">セラピスト追加</h3>
            <div className="space-y-4">
              <EditField label="氏名 *" value={newTherapist.name} onChange={v => setNewTherapist({...newTherapist, name: v})} placeholder="例: 田中 太郎" />
              <EditField label="メールアドレス *" value={newTherapist.email} onChange={v => setNewTherapist({...newTherapist, email: v})} placeholder="例: taro@example.com" />
              <EditField label="電話番号" value={newTherapist.phone} onChange={v => setNewTherapist({...newTherapist, phone: v})} placeholder="例: 090-1234-5678" />
              <EditField label="取り分率 (%)" value={String(newTherapist.commission_rate)} onChange={v => setNewTherapist({...newTherapist, commission_rate: Number(v)})} type="number" />
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={() => setShowAddTherapist(false)} className="flex-1 px-4 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200">キャンセル</button>
              <button onClick={handleAddTherapist} className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700">追加する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div>
    <label className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-1">{icon}{label}</label>
    <p className="text-gray-900 font-medium">{value}</p>
  </div>
);

const EditField = ({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" />
  </div>
);

export default AdminOfficeDetail;
