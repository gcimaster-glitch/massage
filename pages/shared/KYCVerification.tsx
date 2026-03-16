import React, { useState, useRef } from 'react';
import { Camera, CheckCircle, AlertCircle, Loader2, ArrowLeft, ShieldCheck, FileText, Upload, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ============================================
// KYC本人確認ページ（本番対応版）
// AI Studio専用APIを排除し、バックエンドAPI経由で本人確認申請を行う
// ============================================

type IdType = 'DRIVERS_LICENSE' | 'MY_NUMBER_CARD' | 'PASSPORT' | 'RESIDENCE_CARD';

const ID_TYPE_LABELS: Record<IdType, string> = {
  DRIVERS_LICENSE: '運転免許証',
  MY_NUMBER_CARD: 'マイナンバーカード',
  PASSPORT: 'パスポート',
  RESIDENCE_CARD: '在留カード',
};

const KYCVerification: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'select' | 'upload' | 'confirm' | 'submitted'>('select');
  const [idType, setIdType] = useState<IdType>('DRIVERS_LICENSE');
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズ制限（10MB）
    if (file.size > 10 * 1024 * 1024) {
      setError('ファイルサイズは10MB以下にしてください');
      return;
    }

    // 対応形式チェック
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic'].includes(file.type)) {
      setError('JPEG・PNG・WebP・HEIC形式の画像をアップロードしてください');
      return;
    }

    setError(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setStep('confirm');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!imageFile || !image) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Base64データのみ抽出（data:image/...;base64, の部分を除く）
      const base64Data = image.split(',')[1];

      const res = await fetch('/api/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_type: idType,
          file_name: imageFile.name,
          file_size: imageFile.size,
          mime_type: imageFile.type,
          document_data: base64Data,
        }),
      });

      const data = await res.json() as { error?: string; kyc_status?: string };

      if (!res.ok) {
        throw new Error(data.error || '申請に失敗しました');
      }

      setStep('submitted');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '申請に失敗しました。もう一度お試しください。';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setImage(null);
    setImageFile(null);
    setError(null);
    setStep('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ============================================
  // Step 1: 証明書種類の選択
  // ============================================
  if (step === 'select') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-20 px-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">本人確認（KYC）</h1>
            <p className="text-sm text-gray-500">身分証明書をアップロードしてください</p>
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-teal-800">なぜ本人確認が必要ですか？</p>
              <p className="text-sm text-teal-700 mt-1">
                HOGUSYでは、安全なサービス提供のため、セラピスト・オフィス・拠点ホストの方に本人確認をお願いしています。
                提出された書類は暗号化して安全に保管され、審査目的以外には使用しません。
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">提出する証明書の種類を選択してください</p>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(ID_TYPE_LABELS) as [IdType, string][]).map(([type, label]) => (
              <button
                key={type}
                onClick={() => setIdType(type)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  idType === type
                    ? 'border-teal-500 bg-teal-50 text-teal-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className={`w-5 h-5 mb-2 ${idType === type ? 'text-teal-600' : 'text-gray-400'}`} />
                <p className="text-sm font-semibold">{label}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setStep('upload')}
          className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-700 transition-colors"
        >
          次へ：書類をアップロード
        </button>
      </div>
    );
  }

  // ============================================
  // Step 2: 画像アップロード
  // ============================================
  if (step === 'upload') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-20 px-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep('select')} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">書類のアップロード</h1>
            <p className="text-sm text-gray-500">{ID_TYPE_LABELS[idType]}を撮影またはアップロード</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-sm font-semibold text-amber-800 mb-2">📸 撮影のポイント</p>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• 明るい場所で撮影してください</li>
            <li>• 書類全体が写るようにしてください</li>
            <li>• 文字がはっきり読めることを確認してください</li>
            <li>• 光の反射・影がないようにしてください</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 p-8 bg-white border-2 border-dashed border-gray-300 rounded-2xl hover:border-teal-400 hover:bg-teal-50 transition-all"
          >
            <Camera className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-semibold text-gray-600">カメラで撮影</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 p-8 bg-white border-2 border-dashed border-gray-300 rounded-2xl hover:border-teal-400 hover:bg-teal-50 transition-all"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-semibold text-gray-600">ファイルを選択</span>
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // Step 3: 確認・送信
  // ============================================
  if (step === 'confirm') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-20 px-4">
        <div className="flex items-center gap-4">
          <button onClick={handleRetake} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">内容の確認</h1>
            <p className="text-sm text-gray-500">書類の内容を確認して申請してください</p>
          </div>
        </div>

        {image && (
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <img src={image} alt="アップロードした書類" className="w-full object-contain max-h-64" />
          </div>
        )}

        <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">書類の種類</span>
            <span className="text-sm font-semibold text-gray-900">{ID_TYPE_LABELS[idType]}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">ファイル名</span>
            <span className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{imageFile?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">ファイルサイズ</span>
            <span className="text-sm font-semibold text-gray-900">
              {imageFile ? `${(imageFile.size / 1024).toFixed(0)} KB` : '-'}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleRetake}
            className="flex items-center justify-center gap-2 py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            撮り直す
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                申請中...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                申請する
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          申請後、通常1〜3営業日以内に審査結果をメールでお知らせします。
        </p>
      </div>
    );
  }

  // ============================================
  // Step 4: 申請完了
  // ============================================
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20 px-4 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-teal-600" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-black text-gray-900 mb-2">申請が完了しました</h1>
        <p className="text-gray-500">
          本人確認書類を受け付けました。<br />
          審査結果は登録メールアドレスにお送りします。<br />
          通常1〜3営業日以内にご連絡します。
        </p>
      </div>
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 w-full">
        <p className="text-sm text-teal-700 text-center">
          審査中もHOGUSYの閲覧は引き続きご利用いただけます。<br />
          審査が完了次第、すべての機能が利用可能になります。
        </p>
      </div>
      <button
        onClick={() => navigate('/app/account')}
        className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-700 transition-colors"
      >
        マイページに戻る
      </button>
    </div>
  );
};

export default KYCVerification;
