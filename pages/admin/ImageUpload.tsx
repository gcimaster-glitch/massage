import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Trash2, Check, AlertCircle, Loader } from 'lucide-react';

const ImageUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('therapist');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('ファイルを選択してください');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', category);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('アップロードに失敗しました');
      }

      const result = await response.json();
      setUploadResult(result);
      setSelectedFile(null);
      setPreview(null);
    } catch (err: any) {
      setError(err.message || 'アップロードエラー');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            <ImageIcon className="inline-block mr-3" />
            画像アップロード管理
          </h1>
          <p className="text-gray-600">Cloudflare R2に画像をアップロードして管理します</p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              カテゴリー選択
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none font-medium"
            >
              <option value="therapist">セラピスト画像</option>
              <option value="site">施設画像</option>
              <option value="office">オフィス画像</option>
              <option value="general">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              画像ファイル選択
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 file:cursor-pointer"
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="border-2 border-gray-200 rounded-xl p-4">
              <p className="text-sm font-bold text-gray-700 mb-3">プレビュー:</p>
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-md max-h-96 rounded-lg shadow-lg object-contain"
                />
                <button
                  onClick={clearFile}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {selectedFile && (
                <div className="mt-4 space-y-1 text-sm text-gray-600">
                  <p><strong>ファイル名:</strong> {selectedFile.name}</p>
                  <p><strong>サイズ:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                  <p><strong>タイプ:</strong> {selectedFile.type}</p>
                </div>
              )}
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full bg-teal-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader className="animate-spin" size={20} />
                アップロード中...
              </>
            ) : (
              <>
                <Upload size={20} />
                アップロード
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
            <div>
              <p className="font-bold text-red-900">エラー</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success Result */}
        {uploadResult && (
          <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-teal-500 text-white p-2 rounded-full">
                <Check size={20} />
              </div>
              <div>
                <p className="font-bold text-teal-900 text-lg">アップロード成功！</p>
                <p className="text-teal-700 text-sm">画像がCloudflare R2にアップロードされました</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 space-y-2 border border-teal-200">
              <p className="text-sm">
                <strong className="text-gray-700">公開URL:</strong>
              </p>
              <div className="bg-gray-50 px-3 py-2 rounded border border-gray-200 font-mono text-sm break-all">
                {window.location.origin}{uploadResult.url}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}${uploadResult.url}`);
                  alert('URLをコピーしました！');
                }}
                className="text-teal-600 hover:text-teal-700 text-sm font-bold"
              >
                📋 URLをコピー
              </button>
            </div>

            <div className="bg-white rounded-lg p-4 border border-teal-200">
              <p className="text-sm font-bold text-gray-700 mb-2">アップロードされた画像:</p>
              <img
                src={`${window.location.origin}${uploadResult.url}`}
                alt="Uploaded"
                className="max-w-md max-h-96 rounded-lg shadow-lg object-contain"
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">📝 使い方</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li><strong>1.</strong> カテゴリーを選択（セラピスト、施設、オフィス、その他）</li>
            <li><strong>2.</strong> 画像ファイルを選択</li>
            <li><strong>3.</strong> プレビューを確認</li>
            <li><strong>4.</strong> アップロードボタンをクリック</li>
            <li><strong>5.</strong> 生成された公開URLをコピーして使用</li>
          </ol>
        </div>

        {/* Database Update Example */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
          <h3 className="font-bold text-amber-900 mb-3">💡 データベース更新例</h3>
          <p className="text-sm text-amber-800 mb-3">
            アップロード後、セラピストのavatar_urlを更新する場合:
          </p>
          <pre className="bg-white rounded-lg p-4 text-xs font-mono overflow-x-auto border border-amber-200">
{`-- ローカルデータベース
npx wrangler d1 execute hogusy-db-production --local \\
  --command="UPDATE users SET avatar_url='アップロードされたURL' WHERE id='t9'"

-- 本番データベース
npx wrangler d1 execute hogusy-db-production --remote \\
  --command="UPDATE users SET avatar_url='アップロードされたURL' WHERE id='t9'"`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
