/**
 * 入力値バリデーション・サニタイズユーティリティ
 * SQLインジェクション・XSS対策
 */

// ============================================
// 型定義
// ============================================
export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: any;
}

// ============================================
// XSS対策: HTMLエスケープ
// ============================================
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

// ============================================
// SQLインジェクション対策: 危険な文字列チェック
// ============================================
export function containsSqlInjection(input: string): boolean {
  // 危険なSQLパターン
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
    /('|(\\')|(;)|(--)|(\/\*))/gi,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

// ============================================
// メールアドレスバリデーション
// ============================================
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'メールアドレスを入力してください' };
  }

  const trimmed = email.trim();

  // 長さチェック
  if (trimmed.length === 0) {
    return { valid: false, error: 'メールアドレスを入力してください' };
  }

  if (trimmed.length > 254) {
    return { valid: false, error: 'メールアドレスが長すぎます' };
  }

  // メールアドレス形式チェック
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: '有効なメールアドレスを入力してください' };
  }

  // SQLインジェクションチェック
  if (containsSqlInjection(trimmed)) {
    return { valid: false, error: '不正な文字が含まれています' };
  }

  return { valid: true, sanitized: trimmed.toLowerCase() };
}

// ============================================
// パスワードバリデーション
// ============================================
export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'パスワードを入力してください' };
  }

  // 長さチェック
  if (password.length < 8) {
    return { valid: false, error: 'パスワードは8文字以上で設定してください' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'パスワードが長すぎます（最大128文字）' };
  }

  // パスワード強度チェック（推奨）
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

  if (strength < 2) {
    return { 
      valid: false, 
      error: 'パスワードは大文字、小文字、数字、記号のうち2種類以上を含めてください' 
    };
  }

  return { valid: true, sanitized: password };
}

// ============================================
// 名前バリデーション
// ============================================
export function validateName(name: string, fieldName: string = '名前'): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: `${fieldName}を入力してください` };
  }

  const trimmed = name.trim();

  // 長さチェック
  if (trimmed.length === 0) {
    return { valid: false, error: `${fieldName}を入力してください` };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: `${fieldName}が長すぎます（最大100文字）` };
  }

  // SQLインジェクションチェック
  if (containsSqlInjection(trimmed)) {
    return { valid: false, error: '不正な文字が含まれています' };
  }

  // XSSエスケープ
  const sanitized = escapeHtml(trimmed);

  return { valid: true, sanitized };
}

// ============================================
// 電話番号バリデーション
// ============================================
export function validatePhone(phone: string): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: '電話番号を入力してください' };
  }

  const trimmed = phone.trim();

  // ハイフンなしの数字のみに変換
  const digitsOnly = trimmed.replace(/[-\s()]/g, '');

  // 日本の電話番号形式チェック（10桁または11桁）
  const phoneRegex = /^(0[0-9]{9,10})$/;

  if (!phoneRegex.test(digitsOnly)) {
    return { valid: false, error: '有効な電話番号を入力してください（例: 090-1234-5678）' };
  }

  // SQLインジェクションチェック
  if (containsSqlInjection(trimmed)) {
    return { valid: false, error: '不正な文字が含まれています' };
  }

  return { valid: true, sanitized: digitsOnly };
}

// ============================================
// URLバリデーション
// ============================================
export function validateUrl(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URLを入力してください' };
  }

  const trimmed = url.trim();

  try {
    const parsedUrl = new URL(trimmed);
    
    // HTTPSのみ許可（セキュリティ）
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      return { valid: false, error: 'HTTP/HTTPS URLのみ許可されています' };
    }

    // SQLインジェクションチェック
    if (containsSqlInjection(trimmed)) {
      return { valid: false, error: '不正な文字が含まれています' };
    }

    return { valid: true, sanitized: trimmed };
  } catch (error) {
    return { valid: false, error: '有効なURLを入力してください' };
  }
}

// ============================================
// テキストバリデーション（汎用）
// ============================================
export function validateText(
  text: string, 
  options: {
    fieldName?: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    allowHtml?: boolean;
  } = {}
): ValidationResult {
  const {
    fieldName = 'テキスト',
    minLength = 0,
    maxLength = 10000,
    required = true,
    allowHtml = false
  } = options;

  if (!text || typeof text !== 'string') {
    if (required) {
      return { valid: false, error: `${fieldName}を入力してください` };
    }
    return { valid: true, sanitized: '' };
  }

  const trimmed = text.trim();

  // 長さチェック
  if (required && trimmed.length < minLength) {
    return { valid: false, error: `${fieldName}は${minLength}文字以上で入力してください` };
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName}が長すぎます（最大${maxLength}文字）` };
  }

  // SQLインジェクションチェック
  if (containsSqlInjection(trimmed)) {
    return { valid: false, error: '不正な文字が含まれています' };
  }

  // XSSエスケープ（HTMLを許可しない場合）
  const sanitized = allowHtml ? trimmed : escapeHtml(trimmed);

  return { valid: true, sanitized };
}

// ============================================
// 数値バリデーション
// ============================================
export function validateNumber(
  value: any,
  options: {
    fieldName?: string;
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}
): ValidationResult {
  const {
    fieldName = '数値',
    min,
    max,
    integer = false
  } = options;

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num) || typeof num !== 'number') {
    return { valid: false, error: `${fieldName}は数値で入力してください` };
  }

  if (integer && !Number.isInteger(num)) {
    return { valid: false, error: `${fieldName}は整数で入力してください` };
  }

  if (min !== undefined && num < min) {
    return { valid: false, error: `${fieldName}は${min}以上で入力してください` };
  }

  if (max !== undefined && num > max) {
    return { valid: false, error: `${fieldName}は${max}以下で入力してください` };
  }

  return { valid: true, sanitized: num };
}

// ============================================
// 日付バリデーション
// ============================================
export function validateDate(date: string, fieldName: string = '日付'): ValidationResult {
  if (!date || typeof date !== 'string') {
    return { valid: false, error: `${fieldName}を入力してください` };
  }

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return { valid: false, error: `有効な${fieldName}を入力してください` };
  }

  // 妥当な範囲チェック（1900年〜2100年）
  const year = parsedDate.getFullYear();
  if (year < 1900 || year > 2100) {
    return { valid: false, error: `${fieldName}の範囲が不正です` };
  }

  return { valid: true, sanitized: parsedDate.toISOString() };
}

// ============================================
// JSONバリデーション
// ============================================
export function validateJson(json: string, fieldName: string = 'JSON'): ValidationResult {
  if (!json || typeof json !== 'string') {
    return { valid: false, error: `${fieldName}を入力してください` };
  }

  try {
    const parsed = JSON.parse(json);
    return { valid: true, sanitized: parsed };
  } catch (error) {
    return { valid: false, error: `${fieldName}の形式が不正です` };
  }
}
