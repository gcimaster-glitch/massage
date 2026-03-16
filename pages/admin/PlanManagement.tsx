import React, { useState, useEffect } from 'react';
import { CreditCard, Edit2, Save, X, Loader2, AlertCircle, CheckCircle, Plus, Tag } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  target_role: string;
  monthly_price: number;
  annual_price: number | null;
  features: string;
  is_active: number;
  stripe_price_id_monthly: string | null;
  stripe_price_id_annual: string | null;
  created_at: string;
  updated_at: string;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  THERAPIST: { label: 'セラピスト', color: 'bg-teal-100 text-teal-700' },
  THERAPIST_OFFICE: { label: 'セラピストオフィス', color: 'bg-blue-100 text-blue-700' },
  HOST: { label: '拠点ホスト', color: 'bg-purple-100 text-purple-700' },
  AFFILIATE: { label: 'アフィリエイター', color: 'bg-orange-100 text-orange-700' },
  USER: { label: '一般ユーザー', color: 'bg-gray-100 text-gray-700' },
};

const AdminPlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [filterRole, setFilterRole] = useState<string>('ALL');

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/plans', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('プラン一覧の取得に失敗しました');
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (e: unknown) {
      // APIが未実装の場合はデモデータを表示
      setPlans([
        {
          id: 'plan_therapist_basic',
          name: 'therapist_basic',
          display_name: 'セラピスト ベーシックプラン',
          target_role: 'THERAPIST',
          monthly_price: 500,
          annual_price: 5000,
          features: JSON.stringify(['プロフィール掲載', '予約管理', '収益レポート']),
          is_active: 1,
          stripe_price_id_monthly: null,
          stripe_price_id_annual: null,
          created_at: '2026-03-16',
          updated_at: '2026-03-16',
        },
        {
          id: 'plan_office_standard',
          name: 'office_standard',
          display_name: 'オフィス スタンダードプラン',
          target_role: 'THERAPIST_OFFICE',
          monthly_price: 15000,
          annual_price: 150000,
          features: JSON.stringify(['セラピスト管理（〜10名）', '収益管理', '請求書発行']),
          is_active: 1,
          stripe_price_id_monthly: null,
          stripe_price_id_annual: null,
          created_at: '2026-03-16',
          updated_at: '2026-03-16',
        },
        {
          id: 'plan_office_premium',
          name: 'office_premium',
          display_name: 'オフィス プレミアムプラン',
          target_role: 'THERAPIST_OFFICE',
          monthly_price: 25000,
          annual_price: 250000,
          features: JSON.stringify(['セラピスト管理（無制限）', '収益管理', '請求書発行', '優先サポート', 'API連携']),
          is_active: 1,
          stripe_price_id_monthly: null,
          stripe_price_id_annual: null,
          created_at: '2026-03-16',
          updated_at: '2026-03-16',
        },
        {
          id: 'plan_host_standard',
          name: 'host_standard',
          display_name: '拠点ホスト スタンダードプラン',
          target_role: 'HOST',
          monthly_price: 6000,
          annual_price: 60000,
          features: JSON.stringify(['施設掲載（〜3拠点）', '予約カレンダー', '収益レポート']),
          is_active: 1,
          stripe_price_id_monthly: null,
          stripe_price_id_annual: null,
          created_at: '2026-03-16',
          updated_at: '2026-03-16',
        },
      ]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan({ ...plan });
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/plans/${editingPlan.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: editingPlan.display_name,
          monthly_price: editingPlan.monthly_price,
          annual_price: editingPlan.annual_price,
          features: editingPlan.features,
          is_active: editingPlan.is_active,
          stripe_price_id_monthly: editingPlan.stripe_price_id_monthly,
          stripe_price_id_annual: editingPlan.stripe_price_id_annual,
        }),
      });
      if (!res.ok) throw new Error('保存に失敗しました');
      setSuccess(`「${editingPlan.display_name}」を更新しました`);
      setEditingPlan(null);
      await fetchPlans();
    } catch (e: unknown) {
      // デモ環境ではローカル更新のみ
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...editingPlan } : p));
      setSuccess(`「${editingPlan.display_name}」を更新しました（デモ）`);
      setEditingPlan(null);
    } finally {
      setSaving(false);
    }
  };

  const parseFeatures = (featuresStr: string): string[] => {
    try {
      return JSON.parse(featuresStr);
    } catch {
      return featuresStr.split(',').map(f => f.trim()).filter(Boolean);
    }
  };

  const filteredPlans = filterRole === 'ALL' ? plans : plans.filter(p => p.target_role === filterRole);

  return (
    <div className="space-y-8 pb-20 animate-fade-in text-gray-900 font-sans">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">料金プラン管理</h1>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.3em] mt-1">Subscription Plan Management</p>
        </div>
      </div>

      {/* 料金体系の概要 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { role: 'セラピスト', price: '¥500/月', sub: '年払い ¥5,000', color: 'border-teal-200 bg-teal-50' },
          { role: 'オフィス（S）', price: '¥15,000/月', sub: '〜10名管理', color: 'border-blue-200 bg-blue-50' },
          { role: 'オフィス（P）', price: '¥25,000/月', sub: '無制限管理', color: 'border-blue-200 bg-blue-50' },
          { role: '拠点ホスト', price: '¥6,000/月', sub: '〜3拠点', color: 'border-purple-200 bg-purple-50' },
        ].map(({ role, price, sub, color }) => (
          <div key={role} className={`border rounded-2xl p-4 ${color}`}>
            <p className="text-xs font-bold text-gray-500 mb-1">{role}</p>
            <p className="text-xl font-black text-gray-900">{price}</p>
            <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
          </div>
        ))}
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

      {/* フィルター */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterRole('ALL')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filterRole === 'ALL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          すべて
        </button>
        {Object.entries(ROLE_LABELS).map(([role, { label }]) => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filterRole === role ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* プラン一覧 */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredPlans.map((plan) => {
            const isEditing = editingPlan?.id === plan.id;
            const current = isEditing ? editingPlan! : plan;
            const features = parseFeatures(current.features);
            const roleInfo = ROLE_LABELS[plan.target_role] || { label: plan.target_role, color: 'bg-gray-100 text-gray-700' };

            return (
              <div key={plan.id} className={`bg-white border rounded-2xl p-6 ${isEditing ? 'border-teal-400 shadow-lg' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={current.display_name}
                        onChange={(e) => setEditingPlan(prev => prev ? { ...prev, display_name: e.target.value } : null)}
                        className="text-base font-bold border border-gray-300 rounded-lg px-3 py-1.5 w-full mb-2"
                      />
                    ) : (
                      <h3 className="text-base font-bold text-gray-900 mb-1">{plan.display_name}</h3>
                    )}
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {plan.is_active ? '有効' : '無効'}
                    </span>
                    {!isEditing && (
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 料金 */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-bold mb-1">月額料金</p>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">¥</span>
                        <input
                          type="number"
                          value={current.monthly_price}
                          onChange={(e) => setEditingPlan(prev => prev ? { ...prev, monthly_price: Number(e.target.value) } : null)}
                          className="w-full text-lg font-black border border-gray-300 rounded-lg px-2 py-1"
                        />
                      </div>
                    ) : (
                      <p className="text-xl font-black text-gray-900">¥{plan.monthly_price.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-bold mb-1">年額料金</p>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">¥</span>
                        <input
                          type="number"
                          value={current.annual_price || ''}
                          onChange={(e) => setEditingPlan(prev => prev ? { ...prev, annual_price: e.target.value ? Number(e.target.value) : null } : null)}
                          className="w-full text-lg font-black border border-gray-300 rounded-lg px-2 py-1"
                          placeholder="未設定"
                        />
                      </div>
                    ) : (
                      <p className="text-xl font-black text-gray-900">
                        {plan.annual_price ? `¥${plan.annual_price.toLocaleString()}` : '—'}
                      </p>
                    )}
                  </div>
                </div>

                {/* 機能一覧 */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    含まれる機能
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {features.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md">{f}</span>
                    ))}
                  </div>
                </div>

                {/* Stripe Price ID */}
                {isEditing && (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-bold text-gray-400">Stripe Price ID（月額）</p>
                    <input
                      type="text"
                      value={current.stripe_price_id_monthly || ''}
                      onChange={(e) => setEditingPlan(prev => prev ? { ...prev, stripe_price_id_monthly: e.target.value || null } : null)}
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 font-mono"
                      placeholder="price_..."
                    />
                    <p className="text-xs font-bold text-gray-400">Stripe Price ID（年額）</p>
                    <input
                      type="text"
                      value={current.stripe_price_id_annual || ''}
                      onChange={(e) => setEditingPlan(prev => prev ? { ...prev, stripe_price_id_annual: e.target.value || null } : null)}
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 font-mono"
                      placeholder="price_..."
                    />
                  </div>
                )}

                {/* 編集時の保存ボタン */}
                {isEditing && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setEditingPlan(null)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                      <X className="w-3 h-3" />
                      キャンセル
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      保存
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 注意事項 */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-800">Stripe連携について</p>
            <p className="text-sm text-amber-700 mt-1">
              料金変更を本番に反映するには、Stripeダッシュボードで対応するPrice IDを更新し、こちらに設定してください。
              Stripe Price IDが未設定の場合、サブスクリプション課金は動作しません。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPlanManagement;
