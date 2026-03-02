import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FileText, Send, CheckCircle, JapaneseYen, RefreshCw,
  AlertCircle, Download, BarChart3, CheckSquare, Landmark, ShieldCheck, Loader2
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

interface FinancialStatement {
  id: string;
  user_id: string;
  user_role: string;
  user_name: string;
  target_month: string;
  total_sales: number;
  payout_amount: number;
  status: string;
  generated_at: string;
  paid_at?: string;
}

const AdminPayouts: React.FC = () => {
  const monthOptions = useMemo(() => {
    const today = new Date();
    const options = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      options.push({ iso, label: `${d.getFullYear()}年 ${d.getMonth() + 1}月` });
    }
    return options;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].iso);
  const [statements, setStatements] = useState<FinancialStatement[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchStatements = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/admin/payouts?month=${selectedMonth}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("精算一覧の取得に失敗しました");
      const data = await res.json();
      setStatements(data.statements || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => { fetchStatements(); }, [fetchStatements]);

  const handleCalculate = async () => {
    if (!confirm(`${selectedMonth}の売上集計をバッチ実行しますか？`)) return;
    setCalculating(true); setError(null); setSuccess(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/admin/payouts/calculate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ target_month: selectedMonth }),
      });
      if (!res.ok) throw new Error("精算バッチの実行に失敗しました");
      const data = await res.json();
      setSuccess(`精算バッチを実行しました。${data.inserted}件の精算データを生成しました。`);
      fetchStatements();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setCalculating(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const label = status === "PAID" ? "振込完了" : "承認";
    if (!confirm(`${label}に変更しますか？`)) return;
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`/api/admin/payouts/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setStatements(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    } catch {
      alert("更新に失敗しました");
    }
  };

  const handleBulkPayout = async () => {
    const approved = statements.filter(s => s.status === "APPROVED");
    if (approved.length === 0) { alert("承認済みの精算がありません"); return; }
    if (!confirm(`承認済みの${approved.length}件に対して振込確定を実行しますか？`)) return;
    for (const s of approved) {
      await handleStatusUpdate(s.id, "PAID");
    }
    setSuccess(`${approved.length}件の振込を確定しました。`);
  };

  const totalPayout = statements.reduce((sum, s) => sum + (s.payout_amount || 0), 0);
  const pendingCount = statements.filter(s => s.status === "PENDING").length;
  const approvedCount = statements.filter(s => s.status === "APPROVED").length;

  return (
    <div className="space-y-8 pb-20 text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">振込・精算管理</h1>
          <p className="text-gray-400 text-sm mt-1">Settlement Cycle & Payout</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm">
            {monthOptions.map(m => <option key={m.iso} value={m.iso}>{m.label}</option>)}
          </select>
          <button onClick={fetchStatements} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
        </div>
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "総支払額", value: `¥${totalPayout.toLocaleString()}`, icon: JapaneseYen, color: "text-teal-600" },
          { label: "精算件数", value: `${statements.length}件`, icon: FileText, color: "text-blue-600" },
          { label: "承認待ち", value: `${pendingCount}件`, icon: AlertCircle, color: "text-orange-500" },
          { label: "承認済み", value: `${approvedCount}件`, icon: CheckSquare, color: "text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <Icon size={18} className={`${color} mb-2`} />
            <p className="text-2xl font-black">{value}</p>
            <p className="text-xs text-gray-400 font-bold mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={handleCalculate} disabled={calculating}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-700 transition-all disabled:opacity-50">
          {calculating ? <Loader2 size={15} className="animate-spin" /> : <BarChart3 size={15} />}
          {selectedMonth}の売上集計を実行
        </button>
        <button onClick={handleBulkPayout} disabled={approvedCount === 0}
          className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-700 transition-all disabled:opacity-50">
          <Send size={15} />
          承認済み一括振込確定 ({approvedCount}件)
        </button>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">
          <Download size={15} />
          全銀フォーマットCSV出力
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <Landmark size={16} className="text-teal-600" />
          <h2 className="font-black">{selectedMonth} 精算一覧</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={28} /></div>
        ) : statements.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="font-bold">精算データがありません</p>
            <p className="text-sm mt-1">「売上集計を実行」ボタンで精算データを生成してください</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
              <tr>
                <th className="p-4 font-bold">パートナー</th>
                <th className="p-4 font-bold">ロール</th>
                <th className="p-4 font-bold text-right">売上合計</th>
                <th className="p-4 font-bold text-right">支払額</th>
                <th className="p-4 font-bold">ステータス</th>
                <th className="p-4 font-bold text-center">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {statements.map((s, i) => (
                <tr key={s.id} className={`hover:bg-teal-50/50 transition-colors ${i % 2 === 1 ? "bg-slate-50" : "bg-white"}`}>
                  <td className="p-4">
                    <p className="font-bold">{s.user_name}</p>
                    <p className="text-xs text-gray-400 font-mono">{s.user_id.slice(0, 8)}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                      s.user_role === "THERAPIST" ? "bg-indigo-100 text-indigo-700" :
                      s.user_role === "HOST" ? "bg-orange-100 text-orange-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>{s.user_role}</span>
                  </td>
                  <td className="p-4 text-right font-mono text-sm text-gray-600">¥{(s.total_sales || 0).toLocaleString()}</td>
                  <td className="p-4 text-right font-black text-teal-700">¥{(s.payout_amount || 0).toLocaleString()}</td>
                  <td className="p-4"><StatusBadge status={s.status as any} /></td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      {s.status === "PENDING" && (
                        <button onClick={() => handleStatusUpdate(s.id, "APPROVED")}
                          className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-all flex items-center gap-1">
                          <ShieldCheck size={12} /> 承認
                        </button>
                      )}
                      {s.status === "APPROVED" && (
                        <button onClick={() => handleStatusUpdate(s.id, "PAID")}
                          className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-bold hover:bg-green-100 transition-all flex items-center gap-1">
                          <Send size={12} /> 振込確定
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPayouts;
