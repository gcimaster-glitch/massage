
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShieldAlert, Radio, 
  Siren, FileText, CheckCircle, Navigation, 
  Gavel, Users, Loader2, AlertCircle
} from 'lucide-react';

interface IncidentDetail {
  id: string;
  booking_id: string;
  reporter_name?: string;
  reporter_email?: string;
  severity: string;
  type: string;
  description: string;
  status: string;
  created_at: string;
  resolved_at?: string;
  scheduled_at?: string;
  service_name?: string;
  price?: number;
  booking_type?: string;
}

const AdminIncidentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`/api/admin/incidents/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('インシデントの取得に失敗しました');
        const data = await res.json();
        setIncident(data.incident);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchIncident();
  }, [id]);

  const handleClose = async () => {
    if (!incident || !confirm('このインシデントを解決済みとしてクローズしますか？')) return;
    setResolving(true);
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/admin/incidents/${incident.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CLOSED' }),
      });
      setIncident(prev => prev ? { ...prev, status: 'CLOSED', resolved_at: new Date().toISOString() } : prev);
    } catch {
      alert('更新に失敗しました');
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
        <AlertCircle className="text-red-600" size={20} />
        <p className="text-red-700">{error || 'インシデントが見つかりません'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-gray-900 font-sans pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-900 transition-all">
            <ArrowLeft size={16} /> Back to Incidents
          </button>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg ${incident.severity === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' : incident.severity === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
              {incident.severity}
            </span>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Case: {incident.id.slice(0, 8)}</h1>
          </div>
          <p className="text-gray-500 font-bold">{incident.type}</p>
        </div>
        <div className="flex gap-3">
          {incident.status === 'OPEN' && (
            <button className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 shadow-xl active:scale-95 flex items-center gap-3">
              <Siren size={18} /> 緊急配備要請
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 px-4">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-10">
          {/* Incident Info */}
          <section className="bg-white p-10 rounded-[56px] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3"><Radio className="text-red-500" /> インシデント詳細</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ステータス</p>
                  <span className={`px-3 py-1 rounded-lg text-xs font-black ${incident.status === 'OPEN' ? 'bg-red-100 text-red-700' : incident.status === 'RESOLVED' || incident.status === 'CLOSED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {incident.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">発生日時</p>
                  <p className="font-bold text-sm">{new Date(incident.created_at).toLocaleString('ja-JP')}</p>
                </div>
                {incident.resolved_at && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">解決日時</p>
                    <p className="font-bold text-sm text-green-600">{new Date(incident.resolved_at).toLocaleString('ja-JP')}</p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">予約ID</p>
                  <p className="font-mono text-sm">{incident.booking_id}</p>
                </div>
                {incident.service_name && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">サービス</p>
                    <p className="font-bold text-sm">{incident.service_name}</p>
                  </div>
                )}
                {incident.reporter_name && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">報告者</p>
                    <p className="font-bold text-sm">{incident.reporter_name}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-[32px]">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">説明</p>
              <p className="text-sm text-gray-700 leading-relaxed font-bold">{incident.description}</p>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
            <h3 className="text-lg font-black flex items-center gap-2"><Gavel size={20} className="text-indigo-600" /> ガバナンス・アクション</h3>
            <div className="space-y-3">
              <ActionButton icon={<ShieldAlert size={16}/>} label="ユーザーアカウントを永久凍結" color="text-red-600 bg-red-50" />
              <ActionButton icon={<FileText size={16}/>} label="証跡データパッケージ(ZIP)作成" />
              <ActionButton icon={<Users size={16}/>} label="法務・弁護士チームへ共有" />
            </div>
            {(incident.status === 'OPEN' || incident.status === 'UNDER_REVIEW') && (
              <div className="pt-6 border-t border-gray-100">
                <button onClick={handleClose} disabled={resolving}
                  className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-teal-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                  {resolving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  解決済みとしてクローズ
                </button>
              </div>
            )}
          </section>

          <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100">
            <p className="text-[10px] text-indigo-700 font-bold leading-relaxed">
              ※ このインシデントに関する全データ（音声、位置情報、チャット）は、日本の法律に基づき、裁判所の命令なしに第三者へ開示されることはありません。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, color = "text-gray-700 bg-gray-50" }: any) => (
  <button className={`w-full p-4 rounded-2xl font-black text-xs flex items-center gap-3 hover:shadow-md transition-all ${color}`}>
    {icon} {label}
  </button>
);

export default AdminIncidentDetail;
