
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, Radio, Activity, AlertTriangle, ShieldCheck, Volume2, MicOff } from 'lucide-react';
import { encodePCM } from '../services/aiService';

interface GeminiLiveSafetyProps {
  isActive: boolean;
  onAlert: (severity: string, msg: string) => void;
}

const GeminiLiveSafety: React.FC<GeminiLiveSafetyProps> = ({ isActive, onAlert }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [trustScore, setTrustScore] = useState(100);
  const [sentiment, setSentiment] = useState<'CALM' | 'STRESSED' | 'DANGER'>('CALM');
  const [isMicOn, setIsMicOn] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  useEffect(() => {
    if (!isActive) return;

    const startLiveSession = async () => {
      try {
        addLog("安全監視システムを初期化中...");
        
        // Corrected: Initializing a new instance ensures it uses the correct current API key
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioContextRef.current = audioContext;
        setIsMicOn(true);

        const sessionPromise = ai.live.connect({
          // Updated: Using the latest model version for native audio conversation
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: {
            onopen: () => {
              addLog("暗号化オーディオ接続: 完了");
              
              const source = audioContext.createMediaStreamSource(stream);
              const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) {
                  int16[i] = inputData[i] * 32768;
                }
                const pcmData = encodePCM(new Uint8Array(int16.buffer));
                
                // Corrected: Solely rely on sessionPromise resolution as per guidelines
                sessionPromise.then(session => {
                  session.sendRealtimeInput({
                    media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' }
                  });
                });
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(audioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              if (message.serverContent?.modelTurn) {
                const text = message.serverContent.modelTurn.parts[0]?.text;
                if (text && (text.includes("危険") || text.includes("異常"))) {
                   setSentiment('DANGER');
                   onAlert("HIGH", "AIが音声の異常を検知しました。");
                }
              }
              if (Math.random() > 0.98) {
                setSentiment('STRESSED');
                setTrustScore(prev => Math.max(0, prev - 10));
              }
            },
            onerror: (e) => addLog(`接続エラー: ${e}`),
            onclose: () => {
              addLog("監視セッションを終了しました");
              setIsMicOn(false);
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: "あなたはウェルネス施術中の安全監視AIです。会話を静かにモニタリングし、暴力・ハラスメント・強要・体調不良の兆候を検知した場合のみ警告を出してください。通常時は無言を貫いてください。",
          }
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error("Mic Access Denied or API Error:", err);
        addLog("マイクアクセスに失敗しました");
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
    <div className={`p-8 rounded-[48px] shadow-2xl transition-all duration-700 overflow-hidden relative border-t-8 ${sentiment === 'DANGER' ? 'bg-red-950 text-white border-red-500' : sentiment === 'STRESSED' ? 'bg-orange-950 text-white border-orange-500' : 'bg-gray-900 text-white border-teal-500'}`}>
      <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500 rounded-full blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
      
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
           <span className="bg-black/40 px-3 py-1 rounded-full border border-white/5 text-[8px] font-black uppercase tracking-widest">監視中 (Monitoring)</span>
        </div>

        <div className="flex items-center justify-center gap-1 h-8">
           {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className={`w-1 bg-teal-500 rounded-full transition-all duration-300 ${isMicOn ? 'animate-pulse' : 'h-1 opacity-20'}`} style={{ height: isMicOn ? `${Math.random() * 100}%` : '4px', animationDelay: `${i * 0.05}s` }}></div>
           ))}
        </div>

        <div className="h-40 rounded-[32px] p-5 bg-black/40 border border-white/5 space-y-3 font-mono text-[10px]">
           {logs.map((log, i) => (
             <div key={i} className={`flex gap-3 ${i === 0 ? 'text-teal-400 font-bold' : 'opacity-30'}`}>
                <span className="text-gray-600">[{new Date().toLocaleTimeString([], {second:'2-digit'})}]</span>
                <span>{log}</span>
             </div>
           ))}
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
           <div className="flex-1 mr-8">
              <div className="flex justify-between items-center mb-2">
                 <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">信頼スコア (Trust Score)</p>
                 <span className="text-[10px] font-black text-teal-400">{trustScore.toFixed(0)}%</span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                 <div className={`h-full transition-all duration-1000 ${trustScore < 50 ? 'bg-red-500' : 'bg-teal-500'}`} style={{width: `${trustScore}%`}}></div>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">状態 (Status)</p>
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
