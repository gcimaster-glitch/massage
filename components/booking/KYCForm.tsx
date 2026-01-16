/**
 * KYCForm: 本人確認（KYC）フォーム
 * - 出張予約時に必須
 * - 身分証アップロード
 * - セルフィー撮影
 */

import React, { useState } from 'react';
import { ArrowLeft, Upload, Camera, AlertCircle } from 'lucide-react';

interface KYCFormProps {
  onComplete: () => void;
  onBack: () => void;
}

const KYCForm: React.FC<KYCFormProps> = ({ onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    furigana: '',
    birth_date: '',
    phone: '',
    postal_code: '',
    address: '',
    identity_document_type: 'DRIVERS_LICENSE' as const,
  });
  const [identityFront, setIdentityFront] = useState<File | null>(null);
  const [identityBack, setIdentityBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!formData.full_name || !formData.phone || !formData.address) {
      alert('必須項目を入力してください');
      return;
    }
    if (!identityFront || !selfie) {
      alert('身分証明書とセルフィーをアップロードしてください');
      return;
    }

    setIsSubmitting(true);

    try {
      // KYC提出API（実際の実装では画像をBase64またはS3にアップロード）
      // const response = await fetch('/api/kyc/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...formData,
      //     identity_document_front: identityFrontBase64,
      //     identity_document_back: identityBackBase64,
      //     selfie_photo: selfieBase64,
      //   })
      // });

      // 仮の成功処理
      setTimeout(() => {
        alert('本人確認書類を受け付けました。審査完了までお待ちください。');
        onComplete();
      }, 1000);
    } catch (error) {
      alert('本人確認の提出に失敗しました');
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) setter(file);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          戻る
        </button>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900 mb-1">出張予約には本人確認が必要です</p>
              <p className="text-xs text-amber-700">
                セラピストとお客様の安全のため、本人確認書類のご提出をお願いしています。
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-6">本人確認情報の入力</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 基本情報 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              氏名 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="山田 太郎"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              フリガナ <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.furigana}
              onChange={(e) => setFormData({ ...formData, furigana: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="ヤマダ タロウ"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              生年月日 <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              電話番号 <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="090-1234-5678"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              住所 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="東京都渋谷区..."
              required
            />
          </div>

          {/* 身分証明書アップロード */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-3">身分証明書</h3>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                表面 <span className="text-red-600">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setIdentityFront)}
                  className="hidden"
                  id="identity-front"
                />
                <label htmlFor="identity-front" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {identityFront ? identityFront.name : 'クリックして画像をアップロード'}
                  </p>
                </label>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                裏面（任意）
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setIdentityBack)}
                  className="hidden"
                  id="identity-back"
                />
                <label htmlFor="identity-back" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {identityBack ? identityBack.name : 'クリックして画像をアップロード'}
                  </p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                セルフィー <span className="text-red-600">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) => handleFileChange(e, setSelfie)}
                  className="hidden"
                  id="selfie"
                />
                <label htmlFor="selfie" className="cursor-pointer">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {selfie ? selfie.name : '顔写真を撮影'}
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            {isSubmitting ? '送信中...' : '本人確認書類を提出'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default KYCForm;
