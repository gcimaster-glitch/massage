
import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_THERAPISTS } from "../constants";

/**
 * ユーザーの悩み、指定日時、現在のシフト状況から最適なセラピストを提案する
 */
export const suggestTherapist = async (userInput: string, targetDate?: string, targetTime?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // デフォルトは本日
  const effectiveDate = targetDate || new Date().toISOString().split('T')[0];
  
  // シフト状況を含めたコンテキスト作成 (Mock Data Logic)
  const therapistData = JSON.stringify(MOCK_THERAPISTS.map(t => {
    // 擬似的な空き状況生成ロジック
    const seed = t.id.charCodeAt(0) + (effectiveDate ? effectiveDate.length : 0);
    const isAvailable = seed % 3 !== 0; 
    
    return {
      id: t.id,
      name: t.name,
      categories: t.categories,
      rating: t.rating,
      requested_slot: `${effectiveDate} ${targetTime || '現在'}`,
      status: isAvailable ? "予約可能" : "既に予約あり",
      reason_for_match: "このセラピストは指定された部位のケアに定評があります。"
    };
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      あなたはウェルネスプラットフォーム Soothe の優秀なコンシェルジュです。
      
      【ユーザーの悩み】: "${userInput}"
      【希望日時】: ${effectiveDate} ${targetTime || '未指定'}
      
      提供されたセラピストリストから、ユーザーの悩みを解決でき、かつ「予約可能」なセラピストを1〜2名厳選して推薦してください。
      回答はユーザーをリラックスさせる丁寧な日本語で行ってください。
      
      セラピストリスト: ${therapistData}
      
      回答は日本語のJSON形式で返してください。
      スキーマ: { "recommendations": [{ "id": string, "reason": string }], "message": string }
    `,
    config: {
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(response.text || "{}");
};

/**
 * 予約確定メールの日本語下書きを生成する
 */
export const draftBookingConfirmationEmail = async (bookingDetails: any, recipientRole: 'USER' | 'THERAPIST' | 'HOST') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      あなたはSoothe Japanの自動配信メールシステムです。
      以下の予約詳細に基づき、${recipientRole}宛の予約確定通知メールを日本語で下書きしてください。
      
      詳細: ${JSON.stringify(bookingDetails)}
      
      役割に応じた配慮：
      - USER宛: 安心感と期待感を与える。
      - THERAPIST宛: 業務遂行に必要な情報（場所、日時）を簡潔に。安全管理へのリマインド。
      - HOST宛: 施設利用のスケジュール。
      
      件名と本文を含むJSONで返してください。
      スキーマ: { "subject": string, "body": string }
    `,
    config: {
      responseMimeType: "application/json",
    }
  });
  return JSON.parse(response.text || "{}");
};

/**
 * レビューを解析し、セラピストからの返信を自動生成する
 */
export const analyzeReviewAndGenerateResponse = async (therapistName: string, rating: number, comment: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      あなたはセラピストの「${therapistName}」です。
      お客様から以下の評価とコメントをいただきました。
      
      評価: ${rating}つ星
      コメント: "${comment}"
      
      このレビューに対して、感謝の気持ちと今後の意欲を込めた温かい返信を生成してください。
      回答は日本語のJSON形式で返してください。
      スキーマ: { "reply": string, "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE" }
    `,
    config: {
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(response.text || "{}");
};

/**
 * 施術内容の自動要約とSOAPカルテの生成
 */
export const generateSessionSoapNote = async (transcript: string, therapistNotes: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      以下の施術中の会話記録とセラピストのメモから、プロフェッショナルなSOAP形式のカルテを生成してください。
      
      会話記録: "${transcript}"
      セラピストメモ: "${therapistNotes}"
      
      回答はJSON形式で返してください。
      スキーマ: {
        "subjective": "患者の主訴・発言",
        "objective": "専門家から見た客観的な身体状態（筋肉の張り、姿勢等）",
        "assessment": "分析と評価",
        "plan": "今後の推奨ケア・次回の提案",
        "summary": "ユーザー向けの分かりやすい要約"
      }
    `,
    config: {
      responseMimeType: "application/json",
    }
  });
  return JSON.parse(response.text || "{}");
};

/**
 * Google Maps Grounding を使用して周辺の安全情報を取得する
 */
export const getNearbySafetyInfo = async (lat: number, lng: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "現在地の周辺にある警察署、交番、および救急病院をリストアップしてください。",
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      }
    }
  });

  return {
    text: response.text,
    chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

/**
 * 身分証画像のAI解析 (KYC)
 */
export const analyzeIDCard = async (base64Image: string, mimeType: string) => {
  // Corrected: Initializing a new instance ensures it uses the correct current API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    // Corrected: Using gemini-3-pro-preview for complex multimodal analysis
    model: 'gemini-3-pro-preview',
    // Corrected: Multimodal inputs must use parts array within contents object
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: "この身分証画像を解析してください。氏名、生年月日、有効期限を抽出し、画像に加工の疑いがないか、または情報か鮮明かを確認してください。結果はJSONで返してください。スキーマ: { \"name\": string, \"birthdate\": string, \"is_valid\": boolean, \"reason\": string }",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
    }
  });
  return JSON.parse(response.text || "{}");
};

export function encodePCM(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodePCM(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
