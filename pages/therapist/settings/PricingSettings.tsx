import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, DollarSign } from 'lucide-react';
import SimpleLayout from '../../../components/SimpleLayout';

const PricingSettings: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [pricing, setPricing] = useState({
    basePrice60min: 8000,
    onsitePrice60min: 8000,
    outcallPrice60min: 10000,
    overtimePrice30min: 4000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('料金設定を保存しました');
    }, 1000);
  };

  return (
    <SimpleLayout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <button onClick={() => navigate('/t/settings')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft size={20} />
            <span>個人設定に戻る</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="text-teal-600" />
            60分単価設定
          </h1>
          <p className="text-sm text-gray-600 mt-1">基本料金を設定してください</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">施設内施術（60分）</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
              <input
                type="number"
                value={pricing.onsitePrice60min}
                onChange={(e) => setPricing({ ...pricing, onsitePrice60min: parseInt(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">出張施術（60分）</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
              <input
                type="number"
                value={pricing.outcallPrice60min}
                onChange={(e) => setPricing({ ...pricing, outcallPrice60min: parseInt(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">延長料金（30分）</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
              <input
                type="number"
                value={pricing.overtimePrice30min}
                onChange={(e) => setPricing({ ...pricing, overtimePrice30min: parseInt(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">料金設定の目安</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 施設内施術: ¥6,000〜¥12,000/60分</li>
              <li>• 出張施術: 施設内+¥2,000〜¥3,000</li>
              <li>• 延長料金: 通常料金の50%程度</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saving ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>
    </SimpleLayout>
  );
};

export default PricingSettings;
