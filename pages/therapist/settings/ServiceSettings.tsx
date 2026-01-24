import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Briefcase, Check } from 'lucide-react';
import SimpleLayout from '../../../components/SimpleLayout';

const ServiceSettings: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // 提供可能な施術メニュー
  const availableServices = [
    { id: 'relaxation', name: 'リラクゼーションマッサージ', duration: 60 },
    { id: 'sports', name: 'スポーツマッサージ', duration: 60 },
    { id: 'aromatherapy', name: 'アロマセラピー', duration: 60 },
    { id: 'thai', name: 'タイ古式マッサージ', duration: 90 },
    { id: 'shiatsu', name: '指圧', duration: 60 },
    { id: 'swedish', name: 'スウェーデン式マッサージ', duration: 60 },
    { id: 'deep_tissue', name: 'ディープティシュー', duration: 60 },
    { id: 'lymphatic', name: 'リンパドレナージュ', duration: 60 },
    { id: 'reflexology', name: 'リフレクソロジー', duration: 45 },
    { id: 'acupressure', name: '指圧・経絡', duration: 60 },
  ];

  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    new Set(['relaxation', 'sports', 'shiatsu'])
  );

  const toggleService = (serviceId: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // TODO: API呼び出し
    console.log('Selected services:', Array.from(selectedServices));
    setTimeout(() => {
      setSaving(false);
      alert('対応可能メニューを保存しました');
    }, 1000);
  };

  return (
    <SimpleLayout>
      <div className="max-w-4xl mx-auto p-6">
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
            <Briefcase className="text-purple-600" />
            対応可能メニュー
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            提供できる施術メニューを選択してください（複数選択可）
          </p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* サービス一覧 */}
          <div className="space-y-3">
            {availableServices.map((service) => {
              const isSelected = selectedServices.has(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          isSelected ? 'bg-teal-500' : 'bg-gray-200'
                        }`}
                      >
                        {isSelected && <Check size={16} className="text-white" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-500">標準時間: {service.duration}分</p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 選択サマリー */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              選択中: {selectedServices.size}件
            </h4>
            <p className="text-sm text-blue-800">
              {selectedServices.size > 0
                ? `${Array.from(selectedServices)
                    .map((id) => availableServices.find((s) => s.id === id)?.name)
                    .join('、')}`
                : '選択されていません'}
            </p>
          </div>

          {/* 保存ボタン */}
          <button
            type="submit"
            disabled={saving || selectedServices.size === 0}
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

export default ServiceSettings;
