
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, MicOff } from 'lucide-react';
import { encodePCM } from '../services/aiService';

interface GeminiLiveSafetyProps {
  isActive: boolean;
  onAlert: (severity: string, msg: string) => void;
}

// Gemini API キーをランタイムに取得（ビルド時埋め込み不可）
let apiKeyPromise: Promise<string> | null = null;
function getApiKey(): Promise<string> {
  if (apiKeyPromise) return apiKeyPromise;
  apiKeyPromise = fetch('/api/ai/config')
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<{ apiKey?: string }>;
    })
    .then(d => {
      if (!d.apiKey) throw new Error('APIキーが返されませんでした');
      return d.apiKey;
    })
    .catch(err => {
      apiKeyPromise = null;
      throw err;
    });
  return apiKeyPromise;
}

// AIレスポンスから安全状態を判定する
function analyzeSafetyText(text: string): 'CALM' | 'STRESSED' | 'DANGER' {
  const dangerKeywords = ['危険', '助け', 'やめ', '暴力', 'ハラスメント', '緊急', '通報', '110', '119'];
  const stressKeywords = ['不快', '嫌', '痛', '苦し', '困', '体調', '気分が悪'];

  const lower = text;
  if (dangerKeywords.some(k => lower.includes(k))) return 'DANGER';
  if (stressKeywords.some(k => lower.includes(k))) return 'STRESSED';
  return 'CALM';
}

const GeminiLiveSafety: React.FC<GeminiLiveSafetyProps> = ({ isActive, onAlert }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [trustScore, setTrustScore] = useState(100);
  const [sentiment, setSentiment] = useState<'CALM' | 'STRESSED' | 'DANGER'>('CALM');
  const [isMicOn, setIsMicOn] = useState(false);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString('ja', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ${msg}`, ...prev].slice(0, 8));
  };

  useEffect(() => {
    if (!isActive) return;

    const startLiveSession = async () => {
      try {
        addLog('安全監視システムを初期化中...');

        const apiKey = await getApiKey();
        const ai = new GoogleGenAI({ apiKey });
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioContextRef.current = audioContext;
        setIsMicOn(true);

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: {
            onopen: () => {
              addLog('暗号化オーディオ接続: 完了');

              const source = audioContext.createMediaStreamSource(stream);
              const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const int16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                  int16[i] = inputData[i] * 32768;
                }
                const pcmData = encodePCM(new Uint8Array(int16.buffer));
                sessionPromise.then(session => {
                  session.sendRealtimeInput({
                    media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' },
                  });
                });
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(audioContext.destination);
            },
            onmessage: (message: LiveServerMessage) => {
              const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
              if (!text) return;

              const detected = analyzeSafetyText(text);
              if (detected === 'DANGER') {
                setSentiment('DANGER');
                setTrustScore(prev => Math.max(0, prev - 30));
                addLog(`⚠️ 危険シグナル検知: ${text.substring(0, 40)}`);
                onAlert('HIGH', 'AIが音声の危険シグナルを検知しました。');
              } else if (detected === 'STRESSED') {
                setSentiment(prev => prev === 'DANGER' ? 'DANGER' : 'STRESSED');
                setTrustScore(prev => Math.max(0, prev - 10));
                addLog(`注意シグナル: ${text.substring(0, 40)}`);
                onAlert('MEDIUM', 'AIが音声にストレス反応を検知しました。');
              }
            },
            onerror: (e: unknown) => addLog(`接続エラー: ${String(e)}`),
            onclose: () => {
              addLog('監視セッションを終了しました');
              setIsMicOn(false);
            },
          },
          config: {
            responseModalities: [Modality.TEXT],
            systemInstruction:
              'あなたはウェルネス施術中の安全監視AIです。会話をモニタリングし、暴力・ハラスメント・強要・体調不良の兆候を検知した場合のみ日本語で短く報告してください。通常時は無言を貫いてください。',
          },
        });

        sessionRef.current = await sessionPromise;
        addLog('監視開始');
      } catch (err: unknown) {
        console.error('Gemini Live Session Error:', err);
        addLog(`初期化失敗: ${err instanceof Error ? err.message : String(err)}`);
        setIsMicOn(false);
      }
    };

    startLiveSession();

    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [isActive, onAlert]);

  if (!isActive) return null;

  return (
    <div className={`p-8 rounded-[48px] shadow-2xl transition-all duration-700 overflow-hidden relative border-t-8 ${
      sentiment === 'DANGER' ? 'bg-red-950 text-white border-red-500' :
      sentiment === 'STRESSED' ? 'bg-orange-950 text-white border-orange-500' :
      'bg-gray-900 text-white border-teal-500'
    }`}>
      <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500 rounded-full blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${isMicOn ? 'bg-teal-500/20 text-teal-400' : 'bg-red-500/20 text-red-400'}`}>
              {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
            </div>
            <div>
              <h3 className="font-black text-sm">Gemini 安全センチネル</h3>
              <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">自律型音声監視ガード</p>
            </div>
          </div>
          <span className="bg-black/40 px-3 py-1 rounded-full border border-white/5 text-[8px] font-black uppercase tracking-widest">
            {isMicOn ? '監視中' : '停止中'}
          </span>
        </div>

        <div className="flex items-center justify-center gap-1 h-8">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-teal-500 rounded-full transition-all duration-300 ${isMicOn ? 'animate-pulse' : 'opacity-20'}`}
              style={{ height: isMicOn ? `${20 + ((i * 17 + Date.now() / 200) % 80)}%` : '4px', animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>

        <div className="h-40 rounded-[32px] p-5 bg-black/40 border border-white/5 space-y-2 font-mono text-[10px] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="opacity-30">ログなし</p>
          ) : logs.map((log, i) => (
            <div key={i} className={i === 0 ? 'text-teal-400 font-bold' : 'opacity-30'}>
              {log}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex-1 mr-8">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">信頼スコア</p>
              <span className="text-[10px] font-black text-teal-400">{trustScore.toFixed(0)}%</span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${trustScore < 50 ? 'bg-red-500' : 'bg-teal-500'}`}
                style={{ width: `${trustScore}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">状態</p>
            <p className={`text-xs font-black uppercase ${sentiment === 'DANGER' ? 'text-red-500' : sentiment === 'STRESSED' ? 'text-orange-500' : 'text-teal-400'}`}>
              {sentiment === 'DANGER' ? '緊急事態' : sentiment === 'STRESSED' ? '注意' : '安全・正常'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiLiveSafety;
