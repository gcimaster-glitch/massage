import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Award, Plus, X } from 'lucide-react';
import SimpleLayout from '../../../components/SimpleLayout';

const QualificationSettings: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [qualifications, setQualifications] = useState([
    { id: 1, name: 'あん摩マッサージ指圧師', year: 2015, number: '第123456号' },
    { id: 2, name: 'アロマセラピスト認定資格', year: 2018, number: 'AT-12345' },
  ]);
  const [newQual, setNewQual] = useState({ name: '', year: new Date().getFullYear(), number: '' });

  const addQualification = () => {
    if (newQual.name && newQual.number) {
      setQualifications([...qualifications, { ...newQual, id: Date.now() }]);
      setNewQual({ name: '', year: new Date().getFullYear(), number: '' });
    }
  };

  const removeQualification = (id: number) => {
    setQualifications(qualifications.filter((q) => q.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('資格情報を保存しました');
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
            <Award className="text-pink-600" />
            資格・スキル登録
          </h1>
          <p className="text-sm text-gray-600 mt-1">保有資格、スキル、専門分野を登録してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 登録済み資格一覧 */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">登録済み資格</h3>
            {qualifications.length > 0 ? (
              <div className="space-y-3">
                {qualifications.map((qual) => (
                  <div key={qual.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">{qual.name}</h4>
                      <p className="text-sm text-gray-600">取得年: {qual.year}年 / 登録番号: {qual.number}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQualification(qual.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">資格が登録されていません</p>
            )}
          </div>

          {/* 新規資格追加 */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">新しい資格を追加</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">資格名</label>
              <input
                type="text"
                value={newQual.name}
                onChange={(e) => setNewQual({ ...newQual, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="例: あん摩マッサージ指圧師"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">取得年</label>
                <input
                  type="number"
                  value={newQual.year}
                  onChange={(e) => setNewQual({ ...newQual, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">登録番号</label>
                <input
                  type="text"
                  value={newQual.number}
                  onChange={(e) => setNewQual({ ...newQual, number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="例: 第123456号"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addQualification}
              className="w-full bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              追加する
            </button>
          </div>

          {/* 保存ボタン */}
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

export default QualificationSettings;
