import React, { useState, useEffect } from 'react';
import { PieChart, Save, ShieldCheck, Zap, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface RevenueShareRule {
  id: string;
  office_id: string | null;
  booking_type: string | null;
  therapist_rate: number;
  office_rate: number;
  host_rate: number;
  platform_rate: number;
  promotion_rate: number;
  priority: number;
  is_active: number;
  notes: string | null;
  updated_at: string;
}

// 旧APIとの互換性のため残す
interface LegacyRevenueConfig {
  id?: string;
  target_month: string;
  therapist_percentage: number;
  host_percentage: number;
  affiliate_percentage: number;
  platform_percentage: number;
}

const BOOKING_TYPE_LABELS: Record<string, string> = {
  DEFAULT: 'デフォルト（全予約共通）',
  DIRECT: 'セラピスト直接予約',
  SITE_ONLY: '施設利用あり・オフィスなし',
  FULL: '全関係者あり（オフィス＋ホスト）',
};

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const AdminRevenueConfig: React.FC = () => {
  const [rules, setRules] = useState<RevenueShareRule[]>([]);
  const [legacyConfigs, setLegacyConfigs] = useState<LegacyRevenueConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<RevenueShareRule | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'legacy'>('rules');

  // シミュレーター用（デフォルトルールの値を使用）
  const defaultRule = rules.find(r => r.id === 'rule_default_001') || {
    therapist_rate: 40, office_rate: 25, host_rate: 20, platform_rate: 10, promotion_rate: 5
  };

  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      // 新APIから分配ルールを取得
      const res = await fetch('/api/revenue/rules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
      // 旧APIからも取得（互換性）
      const legacyRes = await fetch('/api/admin/revenue-config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (legacyRes.ok) {
        const legacyData = await legacyRes.json();
        setLegacyConfigs(legacyData.configs || []);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleEdit = (rule: RevenueShareRule) => {
    setEditingRule({ ...rule });
  };

  const handleSave = async () => {
    if (!editingRule) return;
    const total = editingRule.therapist_rate + editingRule.office_rate + editingRule.host_rate + editingRule.platform_rate + editingRule.promotion_rate;
    if (Math.abs(total - 100) > 0.01) {
      setError(`合計が100%になっていません（現在: ${total}%）`);
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/revenue/rules/${editingRule.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapist_rate: editingRule.therapist_rate,
          office_rate: editingRule.office_rate,
          host_rate: editingRule.host_rate,
          platform_rate: editingRule.platform_rate,
          promotion_rate: editingRule.promotion_rate,
          notes: editingRule.notes,
        }),
      });
      if (!res.ok) throw new Error('保存に失敗しました');
      setSuccess('分配ルールを更新しました');
      setEditingRule(null);
      await fetchRules();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '保存エラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in text-gray-900 font-sans">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">収益分配設定</h1>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.3em] mt-1">Revenue Share Configuration</p>
        </div>
        <button
          onClick={fetchRules}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          更新
        </button>
      </div>

      {/* 現行モデルの説明 */}
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-teal-800">HOGUSYの収益分配モデル（資料準拠・2026年3月更新）</p>
            <div className="flex flex-wrap gap-4 mt-2">
              {[
                { label: 'セラピスト', rate: 40, color: 'text-teal-700' },
                { label: 'セラピストオフィス', rate: 25, color: 'text-blue-700' },
                { label: '拠点ホスト', rate: 20, color: 'text-purple-700' },
                { label: '本部（HOGUSY）', rate: 10, color: 'text-gray-700' },
                { label: '販促費', rate: 5, color: 'text-orange-600' },
              ].map(({ label, rate, color }) => (
                <span key={label} className={`text-sm font-semibold ${color}`}>
                  {label} <strong>{rate}%</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* エラー・成功メッセージ */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* タブ */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'rules' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          分配ルール管理
        </button>
        <button
          onClick={() => setActiveTab('legacy')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'legacy' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          月次設定履歴（旧）
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        </div>
      ) : activeTab === 'rules' ? (
        /* 分配ルール一覧 */
        <div className="space-y-4">
          {rules.map((rule) => {
            const isEditing = editingRule?.id === rule.id;
            const current = isEditing ? editingRule! : rule;
            const total = current.therapist_rate + current.office_rate + current.host_rate + current.platform_rate + current.promotion_rate;

            return (
              <div key={rule.id} className={`bg-white border rounded-2xl p-6 ${isEditing ? 'border-teal-400 shadow-lg' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      {BOOKING_TYPE_LABELS[rule.booking_type || 'DEFAULT'] || rule.booking_type || 'デフォルト'}
                    </p>
                    {rule.notes && <p className="text-sm text-gray-600 mt-0.5">{rule.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${rule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {rule.is_active ? '有効' : '無効'}
                    </span>
                    {!isEditing && (
                      <button
                        onClick={() => handleEdit(rule)}
                        className="px-3 py-1.5 text-xs font-bold text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50"
                      >
                        編集
                      </button>
                    )}
                  </div>
                </div>

                {/* 分配率バー */}
                <div className="mb-4">
                  <div className="flex h-5 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-teal-500 transition-all flex items-center justify-center" style={{ width: `${current.therapist_rate}%` }}>
                      {current.therapist_rate >= 10 && <span className="text-[9px] font-bold text-white">{current.therapist_rate}%</span>}
                    </div>
                    <div className="bg-blue-500 transition-all flex items-center justify-center" style={{ width: `${current.office_rate}%` }}>
                      {current.office_rate >= 10 && <span className="text-[9px] font-bold text-white">{current.office_rate}%</span>}
                    </div>
                    <div className="bg-purple-500 transition-all flex items-center justify-center" style={{ width: `${current.host_rate}%` }}>
                      {current.host_rate >= 10 && <span className="text-[9px] font-bold text-white">{current.host_rate}%</span>}
                    </div>
                    <div className="bg-gray-500 transition-all flex items-center justify-center" style={{ width: `${current.platform_rate}%` }}>
                      {current.platform_rate >= 8 && <span className="text-[9px] font-bold text-white">{current.platform_rate}%</span>}
                    </div>
                    <div className="bg-orange-400 transition-all flex items-center justify-center" style={{ width: `${current.promotion_rate}%` }}>
                      {current.promotion_rate >= 8 && <span className="text-[9px] font-bold text-white">{current.promotion_rate}%</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3">
                    {[
                      { label: 'セラピスト', key: 'therapist_rate', color: 'bg-teal-500' },
                      { label: 'オフィス', key: 'office_rate', color: 'bg-blue-500' },
                      { label: '拠点ホスト', key: 'host_rate', color: 'bg-purple-500' },
                      { label: '本部', key: 'platform_rate', color: 'bg-gray-500' },
                      { label: '販促費', key: 'promotion_rate', color: 'bg-orange-400' },
                    ].map(({ label, key, color }) => (
                      <div key={key} className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                        <span className="text-xs text-gray-500">{label}</span>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={(current as Record<string, unknown>)[key] as number}
                            onChange={(e) => setEditingRule(prev => prev ? { ...prev, [key]: Number(e.target.value) } : null)}
                            className="w-14 text-xs border border-gray-300 rounded-lg px-2 py-1 text-center font-bold"
                          />
                        ) : (
                          <span className="text-xs font-bold text-gray-800">{(current as Record<string, unknown>)[key] as number}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 編集時の合計表示と保存ボタン */}
                {isEditing && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className={`text-sm font-bold ${Math.abs(total - 100) < 0.01 ? 'text-green-600' : 'text-red-500'}`}>
                      合計: {total}% {Math.abs(total - 100) < 0.01 ? '✓ OK' : '（100%になるよう調整してください）'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingRule(null)}
                        className="px-4 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving || Math.abs(total - 100) > 0.01}
                        className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        保存
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {rules.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">分配ルールがまだ設定されていません</p>
            </div>
          )}
        </div>
      ) : (
        /* 旧月次設定履歴 */
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-xs text-amber-600 font-bold mb-4 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⚠ これは旧システムの月次設定履歴です。現在は上記の「分配ルール管理」タブで管理してください。
          </p>
          {legacyConfigs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">設定履歴がありません</p>
          ) : (
            <div className="space-y-3">
              {legacyConfigs.map((c, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-sm">{c.target_month}</span>
                  <div className="flex gap-4 text-xs font-bold text-gray-500">
                    <span className="text-teal-600">セラピスト: {c.therapist_percentage}%</span>
                    <span className="text-purple-600">ホスト: {c.host_percentage}%</span>
                    <span className="text-orange-500">アフィリエイト: {c.affiliate_percentage}%</span>
                    <span className="text-gray-600">本部: {c.platform_percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Revenue Flow Simulator */}
      <section className="bg-gray-900 text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500 rounded-full blur-[120px] opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-teal-400 w-6 h-6" />
            <h3 className="text-xl font-black tracking-tight">Revenue Flow Simulator</h3>
          </div>
          <p className="text-sm text-gray-400 mb-6">売上10,000円（フル予約：オフィス＋ホストあり）の場合の試算</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'セラピスト', rate: defaultRule.therapist_rate, color: 'text-teal-400' },
              { label: 'オフィス', rate: defaultRule.office_rate, color: 'text-blue-400' },
              { label: '拠点ホスト', rate: defaultRule.host_rate, color: 'text-purple-400' },
              { label: '本部収益', rate: defaultRule.platform_rate, color: 'text-gray-300' },
              { label: '販促費', rate: defaultRule.promotion_rate, color: 'text-orange-400' },
            ].map(({ label, rate, color }) => (
              <div key={label} className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-lg font-black ${color}`}>¥{(10000 * rate / 100).toLocaleString()}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{rate}%</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminRevenueConfig;
