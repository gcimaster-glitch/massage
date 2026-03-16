
import React, { useState, useEffect } from 'react';
import { PieChart, Save, ShieldCheck, Zap, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface RevenueConfig {
  id?: string;
  target_month: string;
  therapist_percentage: number;
  host_percentage: number;
  affiliate_percentage: number;
  platform_percentage: number;
}

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const AdminRevenueConfig: React.FC = () => {
  const [configs, setConfigs] = useState<RevenueConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [targetMonth, setTargetMonth] = useState(getCurrentMonth());
  const [config, setConfig] = useState<RevenueConfig>({
    target_month: getCurrentMonth(),
    therapist_percentage: 60,
    host_percentage: 20,
    affiliate_percentage: 5,
    platform_percentage: 15,
  });

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/admin/revenue-config', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('配分設定の取得に失敗しました');
        const data = await res.json();
        setConfigs(data.configs || []);
        // 最新設定があれば読み込む
        if (data.configs && data.configs.length > 0) {
          const latest = data.configs[0];
          setConfig({
            target_month: getCurrentMonth(),
            therapist_percentage: latest.therapist_percentage,
            host_percentage: latest.host_percentage,
            affiliate_percentage: latest.affiliate_percentage,
            platform_percentage: latest.platform_percentage,
          });
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  // platform_percentageを自動計算
  const computedPlatform = Math.max(0, 100 - config.therapist_percentage - config.host_percentage - config.affiliate_percentage);
  const total = config.therapist_percentage + config.host_percentage + config.affiliate_percentage + computedPlatform;
  const isValid = Math.abs(total - 100) < 0.01;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true); setError(null); setSuccess(null);
    try {
      const token = localStorage.getItem('auth_token');
      const body = { ...config, target_month: targetMonth, platform_percentage: computedPlatform };
      const res = await fetch('/api/admin/revenue-config', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '保存に失敗しました');
      }
      setSuccess(`${targetMonth} の配分設定を保存しました`);
      // 一覧を更新
      const updated = { ...body };
      setConfigs(prev => {
        const idx = prev.findIndex(c => c.target_month === targetMonth);
        if (idx >= 0) { const n = [...prev]; n[idx] = updated; return n; }
        return [updated, ...prev];
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
  }

  return (
    <div className="space-y-10 pb-20 animate-fade-in text-gray-900 font-sans">
      <div>
        <h1 className="text-3xl font-black tracking-tighter">グローバル売上配分・特別契約管理</h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.3em] mt-1">Revenue Hierarchy & Overrides</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700 text-sm">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-10">
        {/* 1. Standard Splits */}
        <section className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 space-y-8">
          <div className="flex items-center gap-3">
            <PieChart className="text-teal-600" />
            <h2 className="text-xl font-black">本部標準配分 (Global Standard)</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-sm font-bold text-gray-600">対象月</span>
              <input type="month" value={targetMonth} onChange={e => setTargetMonth(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold" />
            </div>
            <RateInput label="セラピスト標準配分" value={config.therapist_percentage}
              onChange={v => setConfig(c => ({ ...c, therapist_percentage: v }))} />
            <RateInput label="拠点ホスト" value={config.host_percentage}
              onChange={v => setConfig(c => ({ ...c, host_percentage: v }))} />
            <RateInput label="アフィリエイター" value={config.affiliate_percentage}
              onChange={v => setConfig(c => ({ ...c, affiliate_percentage: v }))} />
            <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-black text-gray-400">プラットフォーム純益（自動計算）</span>
                <span className={`text-2xl font-black ${computedPlatform < 0 ? 'text-red-600' : 'text-teal-600'}`}>{computedPlatform}%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
                <div className="bg-blue-500 h-full transition-all" style={{width: `${config.therapist_percentage}%`}}></div>
                <div className="bg-orange-500 h-full transition-all" style={{width: `${config.host_percentage}%`}}></div>
                <div className="bg-purple-500 h-full transition-all" style={{width: `${config.affiliate_percentage}%`}}></div>
                <div className="bg-teal-500 h-full transition-all" style={{width: `${computedPlatform}%`}}></div>
              </div>
              <div className="flex gap-4 mt-3 text-[10px] font-bold text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>セラピスト</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>ホスト</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>アフィリエイト</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500 inline-block"></span>本部</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              Total: {total}% {isValid ? '✓ OK' : '× 100%にしてください'}
            </p>
            <button onClick={handleSave} disabled={!isValid || saving}
              className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-xs hover:bg-teal-600 disabled:bg-gray-100 transition-all flex items-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              標準設定を保存
            </button>
          </div>
        </section>

        {/* 2. History */}
        <section className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 space-y-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-indigo-600" />
            <h2 className="text-xl font-black">設定履歴</h2>
          </div>
          {configs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">設定履歴がありません</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {configs.map((c, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                  <span className="font-black text-sm">{c.target_month}</span>
                  <div className="flex gap-3 text-xs font-bold text-gray-500">
                    <span className="text-blue-600">T:{c.therapist_percentage}%</span>
                    <span className="text-orange-500">H:{c.host_percentage}%</span>
                    <span className="text-purple-500">A:{c.affiliate_percentage}%</span>
                    <span className="text-teal-600">P:{c.platform_percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-gray-400 font-bold px-2 leading-relaxed">
            ※ 月ごとに配分設定を変更できます。過去の配分は変更されません。
          </p>
        </section>
      </div>

      {/* Simulator */}
      <section className="bg-gray-900 text-white p-12 rounded-[64px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500 rounded-full blur-[120px] opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4 max-w-md">
            <h3 className="text-3xl font-black tracking-tighter flex items-center gap-3"><Zap className="text-teal-400" /> Revenue Flow Simulator</h3>
            <p className="text-sm font-bold text-gray-400 leading-relaxed">設定が正しく反映されているか確認しましょう。<br/>売上10,000円（店舗予約）の場合の試算です。</p>
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <SimCard label="セラピスト" val={`¥${(10000 * config.therapist_percentage/100).toLocaleString()}`} />
            <SimCard label="拠点ホスト" val={`¥${(10000 * config.host_percentage/100).toLocaleString()}`} />
            <SimCard label="アフィリエイト" val={`¥${(10000 * config.affiliate_percentage/100).toLocaleString()}`} />
            <SimCard label="本部収益" val={`¥${(10000 * computedPlatform/100).toLocaleString()}`} color="text-teal-400" />
          </div>
        </div>
      </section>
    </div>
  );
};

const RateInput = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] border border-transparent focus-within:border-teal-500/20 focus-within:bg-white transition-all shadow-inner">
    <span className="font-black text-sm text-gray-600">{label}</span>
    <div className="flex items-center gap-3">
      <input type="number" min={0} max={100} step={0.5}
        className="w-20 bg-white border-2 border-gray-100 rounded-xl px-4 py-2 font-black text-right text-lg outline-none focus:border-teal-500"
        value={value} onChange={e => onChange(Number(e.target.value))} />
      <span className="font-black text-gray-300">%</span>
    </div>
  </div>
);

const SimCard = ({ label, val, color = "text-white" }: { label: string, val: string, color?: string }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] text-center">
    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">{label}</p>
    <p className={`text-xl font-black ${color}`}>{val}</p>
  </div>
);

export default AdminRevenueConfig;
