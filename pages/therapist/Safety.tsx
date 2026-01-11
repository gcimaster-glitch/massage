import React from 'react';
import { ShieldAlert, Phone, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

const TherapistSafety: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">安全管理センター</h1>

      {/* Emergency Section */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-6">
        <h2 className="text-red-800 font-bold text-lg flex items-center gap-2 mb-4">
          <AlertTriangle /> 緊急時アクション
        </h2>
        <div className="flex gap-4">
          <button 
            onClick={() => alert("緊急通報シミュレーション：位置情報が送信され、オペレーターに接続します。")}
            className="flex-1 bg-red-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg hover:bg-red-700 transition-colors flex flex-col items-center gap-2"
          >
            <ShieldAlert size={32} />
            緊急SOS発信
          </button>
          <button className="flex-1 bg-white border-2 border-red-200 text-red-700 p-4 rounded-xl font-bold shadow-sm hover:bg-red-50 transition-colors flex flex-col items-center gap-2">
            <Phone size={32} />
            サポートデスクへ電話
          </button>
        </div>
        <p className="text-xs text-red-600 mt-4 text-center">
          ※ 危険を感じた場合、躊躇なくSOSボタンを押してください。お客様には通知されず、自動録音が開始されます。
        </p>
      </div>

      {/* Guidelines */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="text-teal-600" size={20} /> 訪問前の安全チェック
          </h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" readOnly checked />
              <span>出発前に充電が50%以上あることを確認</span>
            </li>
            <li className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" readOnly checked />
              <span>アプリの位置情報共有がONになっている</span>
            </li>
            <li className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" />
              <span>到着時、玄関先で周囲の状況を確認する</span>
            </li>
            <li className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" />
              <span>違和感がある場合、入室せずにサポートへ連絡</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="text-gray-500" size={20} /> 安全レポート履歴
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>2025/04/10</span>
                <span className="font-bold text-green-600">解決済み</span>
              </div>
              <p className="text-sm font-bold text-gray-800">報告: 顧客による不適切な言動</p>
              <p className="text-xs text-gray-600 mt-1">
                運営コメント: 該当顧客のアカウントを停止しました。報告ありがとうございます。
              </p>
            </div>
            <div className="text-center">
               <button className="text-sm text-teal-600 font-bold hover:underline">
                 + 新しい報告を作成
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistSafety;