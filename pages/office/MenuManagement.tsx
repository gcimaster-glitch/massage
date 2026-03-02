
import React, { useState, useEffect } from 'react';
import {
  Save, Users, ChevronRight, CheckCircle, ShieldCheck, Loader2, AlertCircle
} from 'lucide-react';

interface MasterCourse {
  id: string;
  name: string;
  duration: number;
  category: string;
  base_price: number;
  description?: string;
}

interface MasterOption {
  id: string;
  name: string;
  duration: number;
  base_price: number;
  description?: string;
}

interface Therapist {
  therapist_profile_id: string;
  name: string;
  avatar_url?: string;
}

interface MenuEntry {
  masterId: string;
  name: string;
  duration: number;
  price: number;
  isSelected: boolean;
  description?: string;
}

interface OptionEntry {
  masterId: string;
  name: string;
  price: number;
  isSelected: boolean;
  description?: string;
}

const OfficeMenuManagement: React.FC = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [masterCourses, setMasterCourses] = useState<MasterCourse[]>([]);
  const [masterOptions, setMasterOptions] = useState<MasterOption[]>([]);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'COURSES' | 'OPTIONS'>('COURSES');
  const [localMenu, setLocalMenu] = useState<MenuEntry[]>([]);
  const [localOptions, setLocalOptions] = useState<OptionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const token = localStorage.getItem('auth_token');
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

  // 自分の事務所一覧を取得してセラピスト一覧を取得
  useEffect(() => {
    Promise.all([
      fetch('/api/office-management/my-offices', { headers }).then(r => r.ok ? r.json() : { offices: [] }),
      fetch('/api/office-management/master-courses', { headers }).then(r => r.ok ? r.json() : { courses: [], options: [] }),
    ])
      .then(([officeData, masterData]) => {
        setMasterCourses(masterData.courses || []);
        setMasterOptions(masterData.options || []);
        const offices = officeData.offices || [];
        if (offices.length > 0) {
          const officeId = offices[0].id;
          return fetch(`/api/office-management/${officeId}/therapists`, { headers })
            .then(r => r.ok ? r.json() : { therapists: [] })
            .then(data => setTherapists(data.therapists || []));
        }
      })
      .catch(() => setError('データの取得に失敗しました'))
      .finally(() => setLoading(false));
  }, []);

  // セラピスト選択時にメニューを取得
  useEffect(() => {
    if (!selectedTherapistId || masterCourses.length === 0) return;

    // 自分の事務所IDを取得してメニューを取得
    fetch('/api/office-management/my-offices', { headers })
      .then(r => r.ok ? r.json() : { offices: [] })
      .then(data => {
        const offices = data.offices || [];
        if (offices.length === 0) return;
        const officeId = offices[0].id;
        return fetch(`/api/office-management/${officeId}/therapist-menus/${selectedTherapistId}`, { headers })
          .then(r => r.ok ? r.json() : { courses: [], options: [] })
          .then(menuData => {
            const savedCourses: any[] = menuData.courses || [];
            const savedOptions: any[] = menuData.options || [];

            // マスターコースとマージ
            const merged = masterCourses.map(mc => {
              const saved = savedCourses.find(sc => sc.name === mc.name);
              return {
                masterId: mc.id,
                name: mc.name,
                duration: mc.duration,
                price: saved?.price ?? mc.base_price,
                isSelected: !!saved,
                description: mc.description || '',
              };
            });
            setLocalMenu(merged);

            const mergedOpts = masterOptions.map(mo => {
              const saved = savedOptions.find(so => so.name === mo.name);
              return {
                masterId: mo.id,
                name: mo.name,
                price: saved?.price ?? mo.base_price,
                isSelected: !!saved,
                description: mo.description || '',
              };
            });
            setLocalOptions(mergedOpts);
          });
      });
  }, [selectedTherapistId, masterCourses]);

  const handleToggle = (type: 'COURSES' | 'OPTIONS', masterId: string) => {
    if (type === 'COURSES') {
      setLocalMenu(prev => prev.map(item => item.masterId === masterId ? { ...item, isSelected: !item.isSelected } : item));
    } else {
      setLocalOptions(prev => prev.map(item => item.masterId === masterId ? { ...item, isSelected: !item.isSelected } : item));
    }
  };

  const handlePriceChange = (type: 'COURSES' | 'OPTIONS', masterId: string, price: number) => {
    if (type === 'COURSES') {
      setLocalMenu(prev => prev.map(item => item.masterId === masterId ? { ...item, price } : item));
    } else {
      setLocalOptions(prev => prev.map(item => item.masterId === masterId ? { ...item, price } : item));
    }
  };

  const handleSave = async () => {
    if (!selectedTherapistId) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const officeData = await fetch('/api/office-management/my-offices', { headers }).then(r => r.json());
      const officeId = officeData.offices?.[0]?.id;
      if (!officeId) throw new Error('事務所が見つかりません');

      const selectedCourses = localMenu.filter(m => m.isSelected).map(m => ({
        name: m.name, duration: m.duration, price: m.price, description: m.description
      }));
      const selectedOptions = localOptions.filter(o => o.isSelected).map(o => ({
        name: o.name, price: o.price, description: o.description
      }));

      const res = await fetch(`/api/office-management/${officeId}/therapist-menus/${selectedTherapistId}`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses: selectedCourses, options: selectedOptions }),
      });
      if (!res.ok) throw new Error('保存に失敗しました');
      setSuccessMsg('メニューを保存しました');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      setError(e.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-teal-600" size={40} />
    </div>
  );

  return (
    <div className="space-y-10 pb-40 animate-fade-in text-gray-900 font-sans">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">メニュー構成・個別価格設定</h1>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Managed Pricing & Talent Menus</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 text-green-700">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 mb-4">管理下のセラピスト</h3>
          {therapists.length === 0 ? (
            <p className="text-sm text-gray-400 px-4">セラピストが登録されていません</p>
          ) : (
            <div className="space-y-2">
              {therapists.map(t => (
                <button
                  key={t.therapist_profile_id}
                  onClick={() => setSelectedTherapistId(t.therapist_profile_id)}
                  className={`w-full p-5 rounded-[32px] flex items-center gap-4 transition-all border-4 ${selectedTherapistId === t.therapist_profile_id ? 'bg-gray-900 text-white border-gray-900 shadow-xl scale-[1.02]' : 'bg-white text-gray-500 border-transparent hover:border-gray-100'}`}
                >
                  <img
                    src={t.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&size=40&background=14b8a6&color=fff`}
                    className="w-10 h-10 rounded-2xl object-cover shadow-sm"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&size=40&background=14b8a6&color=fff`; }}
                  />
                  <div className="text-left">
                    <p className="font-black text-xs">{t.name}</p>
                    <p className="text-[8px] opacity-40 uppercase">Assigned Talent</p>
                  </div>
                  {selectedTherapistId === t.therapist_profile_id && <ChevronRight size={14} className="ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {!selectedTherapistId ? (
            <div className="bg-gray-100/50 h-[600px] rounded-[56px] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-200 shadow-sm mb-6"><Users size={40} /></div>
              <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">セラピストを選択してください</h3>
              <p className="text-gray-400 text-sm font-bold mt-2 leading-relaxed">本部定義のマスターからメニューを選択し、価格を設定します。</p>
            </div>
          ) : (
            <div className="space-y-12 animate-fade-in">
              <div className="flex bg-gray-100 p-1.5 rounded-3xl w-fit shadow-inner">
                <button onClick={() => setActiveTab('COURSES')} className={`px-8 py-3 rounded-[22px] text-xs font-black transition-all ${activeTab === 'COURSES' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                  メインコース ({localMenu.filter(m => m.isSelected).length})
                </button>
                <button onClick={() => setActiveTab('OPTIONS')} className={`px-8 py-3 rounded-[22px] text-xs font-black transition-all ${activeTab === 'OPTIONS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                  オプション ({localOptions.filter(m => m.isSelected).length})
                </button>
              </div>

              <div className="bg-white p-10 md:p-12 rounded-[64px] shadow-sm border border-gray-100">
                {(activeTab === 'COURSES' ? localMenu : localOptions).length === 0 ? (
                  <p className="text-center text-gray-400 py-12">マスターデータが登録されていません</p>
                ) : (
                  <div className="grid gap-4">
                    {(activeTab === 'COURSES' ? localMenu : localOptions).map(item => (
                      <div key={item.masterId} className={`p-6 rounded-[32px] border-4 transition-all flex items-center justify-between gap-6 ${item.isSelected ? 'bg-white border-teal-500 shadow-lg' : 'bg-gray-50 border-transparent opacity-60'}`}>
                        <div className="flex items-center gap-6 flex-1">
                          <button
                            onClick={() => handleToggle(activeTab, item.masterId)}
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${item.isSelected ? 'bg-teal-500 text-white' : 'bg-white text-gray-200'}`}
                          >
                            <CheckCircle size={24} />
                          </button>
                          <div>
                            <h4 className="font-black text-gray-900 text-lg leading-none">{item.name}</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">
                              {activeTab === 'COURSES' ? `${(item as MenuEntry).duration}分` : 'オプション'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-300">¥</span>
                            <input
                              type="number"
                              disabled={!item.isSelected}
                              value={item.price}
                              onChange={e => handlePriceChange(activeTab, item.masterId, Number(e.target.value))}
                              className="w-32 pl-8 pr-4 py-3 bg-white border border-gray-100 rounded-2xl font-black text-lg text-right outline-none focus:border-teal-500 shadow-inner disabled:bg-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-900 rounded-[56px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-teal-400 shadow-inner"><ShieldCheck size={32} /></div>
                  <div className="text-white">
                    <h4 className="text-xl font-black">メニューを保存する</h4>
                    <p className="text-xs text-gray-500 font-bold uppercase mt-1">選択したメニューと価格を保存します</p>
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-teal-600 text-white px-16 py-6 rounded-full font-black text-xl hover:bg-teal-500 transition-all flex items-center gap-4 active:scale-95 shadow-xl disabled:opacity-50"
                >
                  {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                  {saving ? '保存中...' : '保存する'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficeMenuManagement;
