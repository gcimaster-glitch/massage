import React, { useState, useEffect } from 'react';
import { Link2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface LinkedAccount {
  provider: string;
  email?: string;
  linkedAt?: string;
}

const SocialAccountSettings: React.FC = () => {
  const [linkedAccounts, setLinkedAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Social providers configuration
  const providers = [
    { id: 'GOOGLE', name: 'Google', icon: '🔍', color: 'bg-red-50 text-red-600 border-red-200' },
    { id: 'YAHOO', name: 'Yahoo! JAPAN', icon: '⚡', color: 'bg-purple-50 text-purple-600 border-purple-200' },
    { id: 'LINE', name: 'LINE', icon: '💬', color: 'bg-green-50 text-green-600 border-green-200' },
    { id: 'X', name: 'X (Twitter)', icon: '🐦', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { id: 'FACEBOOK', name: 'Facebook', icon: '👍', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    { id: 'APPLE', name: 'Apple', icon: '', color: 'bg-gray-50 text-gray-900 border-gray-200' },
  ];

  // Load linked accounts
  useEffect(() => {
    loadLinkedAccounts();
  }, []);

  const loadLinkedAccounts = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLinkedAccounts(data.user.linkedProviders || []);
      }
    } catch (error) {
      console.error('Failed to load linked accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (provider: string) => {
    setActionLoading(provider);
    // Redirect to OAuth flow for linking
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/api/auth/link/${provider.toLowerCase()}?redirectPath=/app/account/social`;
  };

  const handleUnlink = async (provider: string) => {
    if (!confirm(`${provider}の連携を解除しますか？`)) return;

    setActionLoading(provider);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/auth/link/${provider.toLowerCase()}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadLinkedAccounts();
      } else {
        alert('連携解除に失敗しました');
      }
    } catch (error) {
      console.error('Failed to unlink account:', error);
      alert('連携解除に失敗しました');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-24 px-4 font-sans text-gray-900 pt-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="px-4">
          <h1 className="text-5xl font-black tracking-tighter">ソーシャルアカウント連携</h1>
          <p className="text-gray-500 text-sm mt-3">
            外部サービスと連携することで、ワンクリックでログインできるようになります。
          </p>
        </div>

        {/* Providers List */}
        <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {providers.map((provider) => {
            const isLinked = linkedAccounts.includes(provider.id);
            const isProcessing = actionLoading === provider.id;

            return (
              <div
                key={provider.id}
                className="p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${provider.color} border-2 flex items-center justify-center text-2xl`}>
                    {provider.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{provider.name}</h3>
                    <p className="text-sm text-gray-500">
                      {isLinked ? (
                        <span className="flex items-center gap-2 text-green-600">
                          <CheckCircle size={16} />
                          連携済み
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-gray-400">
                          <XCircle size={16} />
                          未連携
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  {isLinked ? (
                    <button
                      onClick={() => handleUnlink(provider.id)}
                      disabled={isProcessing}
                      className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isProcessing && <Loader2 size={16} className="animate-spin" />}
                      連携解除
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLink(provider.id)}
                      disabled={isProcessing}
                      className="px-6 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isProcessing && <Loader2 size={16} className="animate-spin" />}
                      <Link2 size={16} />
                      連携する
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
          <h4 className="font-bold text-blue-900 mb-2">セキュリティについて</h4>
          <p className="text-sm text-blue-700 leading-relaxed">
            連携したアカウントは、HOGUSYへのログインにのみ使用されます。
            パスワードや個人情報は保存されません。
            いつでも連携を解除できます。
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialAccountSettings;
