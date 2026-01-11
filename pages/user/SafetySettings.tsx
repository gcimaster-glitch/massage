import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Plus, Trash2, Phone, User, AlertCircle } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

const SafetySettings: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 'c1', name: '山田 太郎', relation: '配偶者', phone: '090-9999-8888' }
  ]);
  const [shareLocation, setShareLocation] = useState(true);

  const handleDelete = (id: string) => {
    if (confirm('この連絡先を削除しますか？')) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  const handleAdd = () => {
    const name = prompt('名前を入力してください');
    if (!name) return;
    const phone = prompt('電話番号を入力してください');
    if (!phone) return;
    const relation = prompt('続柄を入力してください');
    
    setContacts([...contacts, {
      id: `c-${Date.now()}`,
      name,
      phone,
      relation: relation || 'その他'
    }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900">
           <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">安全設定</h1>
      </div>

      {/* Safety Toggle */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="text-teal-600" size={24} />
            <h3 className="font-bold text-gray-900">位置情報の共有</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={shareLocation} onChange={() => setShareLocation(!shareLocation)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>
        <p className="text-sm text-gray-600">
          施術中、信頼できる連絡先にあなたの現在地をリアルタイムで共有します。
        </p>
      </div>

      {/* Emergency Contacts */}
      <div className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h3 className="font-bold text-gray-900">緊急連絡先</h3>
          <button 
            onClick={handleAdd}
            className="text-sm font-bold text-teal-600 flex items-center gap-1 hover:underline"
          >
            <Plus size={16} /> 追加する
          </button>
        </div>

        {contacts.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 text-sm">
            <AlertCircle className="mx-auto mb-2 text-gray-400" size={24} />
            連絡先が登録されていません。<br/>万が一のため、1件以上の登録を推奨します。
          </div>
        ) : (
          contacts.map(contact => (
            <div key={contact.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-900 flex items-center gap-2">
                  <User size={16} className="text-gray-400" /> {contact.name} 
                  <span className="text-xs font-normal bg-gray-100 px-2 py-0.5 rounded text-gray-600">{contact.relation}</span>
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <Phone size={14} /> {contact.phone}
                </p>
              </div>
              <button 
                onClick={() => handleDelete(contact.id)}
                className="text-gray-400 hover:text-red-500 p-2"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-800 border border-blue-100">
        <h4 className="font-bold mb-1 flex items-center gap-1"><AlertCircle size={14} /> 緊急通報機能について</h4>
        <p>
          施術中に「SOSボタン」を使用した場合、登録された緊急連絡先にもSMSで通知が送信されます。
        </p>
      </div>
    </div>
  );
};

export default SafetySettings;