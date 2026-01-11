import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, ArrowLeft, Save, Mail, Phone, Lock } from 'lucide-react';

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  // Mock initial data
  const [name, setName] = useState('山田 花子');
  const [email, setEmail] = useState('hanako.yamada@example.com');
  const [phone] = useState('090-1234-5678'); // Immutable for demo

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // API call would go here
    alert('プロフィールを保存しました');
    navigate('/app/account');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900">
           <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">プロフィール編集</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-3xl font-bold text-teal-700">
              {name.charAt(0)}
            </div>
            <button type="button" className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full hover:bg-teal-600 transition-colors shadow-sm">
              <Camera size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-500">プロフィール写真は予約確定後にセラピストに表示されます。</p>
        </div>

        {/* Input Fields */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">表示名</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none placeholder-gray-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">メールアドレス</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none placeholder-gray-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">電話番号 (認証済み)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                value={phone}
                readOnly
                className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
              />
              <Lock className="absolute right-3 top-3 text-gray-400" size={16} />
            </div>
            <p className="text-xs text-gray-400 mt-1">電話番号の変更はサポートまでお問い合わせください。</p>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
        >
          <Save size={20} />
          変更を保存
        </button>
      </form>
    </div>
  );
};

export default ProfileEdit;