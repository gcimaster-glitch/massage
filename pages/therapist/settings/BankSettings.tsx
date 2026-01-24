import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CreditCard, Building2, User } from 'lucide-react';
import SimpleLayout from '../../../components/SimpleLayout';

const BankSettings: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '三菱UFJ銀行',
    branchName: '渋谷支店',
    branchCode: '123',
    accountType: 'NORMAL',
    accountNumber: '1234567',
    accountHolderName: 'ヤマダ タロウ'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // TODO: API呼び出し
    setTimeout(() => {
      setSaving(false);
      alert('振込先情報を保存しました');
    }, 1000);
  };

  return (
    <SimpleLayout>
      <div className="max-w-3xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/t/settings')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>個人設定に戻る</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="text-green-600" />
            振込先設定
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            報酬振込先の銀行口座情報を設定します
          </p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* 銀行名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 size={16} className="inline mr-1" />
              銀行名
            </label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="例: 三菱UFJ銀行"
              required
            />
          </div>

          {/* 支店名・支店コード */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                支店名
              </label>
              <input
                type="text"
                value={formData.branchName}
                onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="例: 渋谷支店"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                支店コード
              </label>
              <input
                type="text"
                value={formData.branchCode}
                onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="例: 123"
                required
                maxLength={3}
              />
            </div>
          </div>

          {/* 口座種別 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              口座種別
            </label>
            <select
              value={formData.accountType}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="NORMAL">普通</option>
              <option value="CURRENT">当座</option>
            </select>
          </div>

          {/* 口座番号 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              口座番号
            </label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="例: 1234567"
              required
              maxLength={7}
            />
          </div>

          {/* 口座名義 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              口座名義（カナ）
            </label>
            <input
              type="text"
              value={formData.accountHolderName}
              onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="例: ヤマダ タロウ"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              ※ 全角カタカナで入力してください
            </p>
          </div>

          {/* 注意事項 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">変更時の注意事項</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• 振込先の変更は、翌月の支払いから適用されます</li>
              <li>• 口座名義は登録名と一致している必要があります</li>
              <li>• 不正な口座情報が登録された場合、アカウント停止の対象となります</li>
            </ul>
          </div>

          {/* 保存ボタン */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saving ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>
    </SimpleLayout>
  );
};

export default BankSettings;
