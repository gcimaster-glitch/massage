import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Settings as SettingsIcon, Check, Loader2 } from 'lucide-react';
import SimpleLayout from '../../../components/SimpleLayout';

interface OptionItem {
  id: string;
  name: string;
  price: number;
  description?: string;
}

const OptionSettings: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableOptions, setAvailableOptions] = useState<OptionItem[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');

  const getToken = () => localStorage.getItem('auth_token') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/therapists/menu', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (res.ok) {
          const data = await res.json();
          // master_optionsから全オプション一覧を取得
          const allOptions = data.options || data.masterOptions || [];
          setAvailableOptions(allOptions.length > 0 ? allOptions : [
            { id: 'hot_stone', name: 'ホットストーン', price: 2000 },
            { id: 'aromaoil', name: 'アロマオイル', price: 1500 },
            { id: 'stretching', name: 'ストレッチング', price: 1000 },
            { id: 'cupping', name: 'カッピング', price: 2500 },
            { id: 'head_spa', name: 'ヘッドスパ', price: 2000 },
            { id: 'foot_bath', name: 'フットバス', price: 1000 },
          ]);
          // 既に選択済みのオプションを設定
          const selected = (data.options || []).filter((o: any) => o.is_active || o.is_available).map((o: any) => o.id);
          setSelectedOptions(new Set(selected));
        }
      } catch (e) {
        console.error('オプション取得エラー:', e);
        setAvailableOptions([
          { id: 'hot_stone', name: 'ホットストーン', price: 2000 },
          { id: 'aromaoil', name: 'アロマオイル', price: 1500 },
          { id: 'stretching', name: 'ストレッチング', price: 1000 },
          { id: 'cupping', name: 'カッピング', price: 2500 },
          { id: 'head_spa', name: 'ヘッドスパ', price: 2000 },
          { id: 'foot_bath', name: 'フットバス', price: 1000 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleOption = (optionId: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }
    setSelectedOptions(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const optionsToSave = availableOptions
        .filter(o => selectedOptions.has(o.id))
        .map(o => ({ id: o.id, name: o.name, price: o.price, description: o.description || '' }));
      const res = await fetch('/api/therapists/menu/options', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ options: optionsToSave })
      });
      if (res.ok) {
        setMessage('対応可能オプションを保存しました');
      } else {
        setMessage('保存に失敗しました');
      }
    } catch (e) {
      setMessage('エラーが発生しました');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <SimpleLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-teal-600" size={32} />
        </div>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button onClick={() => navigate('/t/settings')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft size={20} />
            <span>個人設定に戻る</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="text-orange-600" />
            対応可能オプション
          </h1>
          <p className="text-sm text-gray-600 mt-1">提供できる追加オプションを選択してください</p>
        </div>
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-800 font-medium">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="space-y-3">
            {availableOptions.map((option) => {
              const isSelected = selectedOptions.has(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleOption(option.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isSelected ? 'bg-teal-500' : 'bg-gray-200'}`}>
                        {isSelected && <Check size={16} className="text-white" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{option.name}</h3>
                        <p className="text-sm text-gray-500">追加料金: ¥{option.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {saving ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>
    </SimpleLayout>
  );
};

export default OptionSettings;
