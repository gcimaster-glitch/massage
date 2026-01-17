/**
 * モックデータ管理画面
 * 管理者がモックデータの挿入・削除を簡単に行えるUI
 */

import React, { useState, useEffect } from 'react';
import { Database, Trash2, Plus, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const MockDataManager: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // モックデータの状態を取得
  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/mock-data/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        setMessage({ type: 'error', text: '状態の取得に失敗しました' });
      }
    } catch (error) {
      console.error('Status fetch error:', error);
      setMessage({ type: 'error', text: '状態の取得中にエラーが発生しました' });
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // モックデータを挿入
  const handleSeedData = async () => {
    if (!confirm('11名のセラピストデータを挿入しますか？')) return;

    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/mock-data/seed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        await fetchStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'データの挿入に失敗しました' });
      }
    } catch (error) {
      console.error('Seed error:', error);
      setMessage({ type: 'error', text: 'データの挿入中にエラーが発生しました' });
    } finally {
      setLoading(false);
    }
  };

  // モックデータを削除
  const handleDeleteData = async () => {
    if (!confirm('⚠️ 全てのモックセラピストデータを削除しますか？\nこの操作は元に戻せません。')) return;

    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/mock-data', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        await fetchStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'データの削除に失敗しました' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: 'データの削除中にエラーが発生しました' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Database className="text-teal-600" size={32} />
              <h1 className="text-2xl font-bold text-gray-900">モックデータ管理</h1>
            </div>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-teal-600 transition-colors"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              更新
            </button>
          </div>

          {/* メッセージ表示 */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              ) : (
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              )}
              <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </p>
            </div>
          )}

          {/* 状態表示 */}
          {status && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">現在の状態</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">セラピスト</p>
                  <p className="text-2xl font-bold text-gray-900">{status.counts.therapists}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">プロフィール</p>
                  <p className="text-2xl font-bold text-gray-900">{status.counts.profiles}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">メニュー</p>
                  <p className="text-2xl font-bold text-gray-900">{status.counts.menus}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">オプション</p>
                  <p className="text-2xl font-bold text-gray-900">{status.counts.options}</p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                {status.hasMockData ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium">モックデータが存在します</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-gray-600">モックデータは存在しません</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">操作</h2>
            
            {/* データ挿入 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Plus size={20} className="text-teal-600" />
                    モックデータを挿入
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    11名のセラピストと関連データ（プロフィール、メニュー、オプション）を挿入します。
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>セラピスト: 11名</li>
                    <li>メニュー: 各セラピスト × 全コース</li>
                    <li>オプション: 各セラピスト × 全オプション</li>
                  </ul>
                </div>
                <button
                  onClick={handleSeedData}
                  disabled={loading}
                  className="ml-4 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus size={20} />
                  {loading ? '挿入中...' : 'データ挿入'}
                </button>
              </div>
            </div>

            {/* データ削除 */}
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Trash2 size={20} className="text-red-600" />
                    モックデータを削除
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    全てのモックセラピストデータ（ID: therapist-*）を削除します。
                  </p>
                  <p className="text-sm text-red-600 font-medium">
                    ⚠️ この操作は元に戻せません。慎重に実行してください。
                  </p>
                </div>
                <button
                  onClick={handleDeleteData}
                  disabled={loading || !status?.hasMockData}
                  className="ml-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  <Trash2 size={20} />
                  {loading ? '削除中...' : 'データ削除'}
                </button>
              </div>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ 注意事項</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>モックデータは開発・テスト環境でのみ使用してください</li>
              <li>本番環境では実際のセラピストデータを使用してください</li>
              <li>データ削除前に必ずバックアップを取得してください</li>
              <li>マスターデータ（コース・オプション）は削除されません</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockDataManager;
