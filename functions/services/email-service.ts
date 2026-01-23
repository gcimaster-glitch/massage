/**
 * メール送信サービス（Resend API）
 * パスワードリセット、予約確認、リマインダーなどに使用
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string = 'HOGUSY <noreply@hogusy.com>') {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }

  /**
   * メール送信
   */
  async send(options: SendEmailOptions): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: options.from || this.fromEmail,
          to: options.to,
          subject: options.subject,
          html: options.html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Resend API error:', error);
        return false;
      }

      const data = await response.json();
      console.log('✅ メール送信成功:', data);
      return true;
    } catch (error) {
      console.error('❌ メール送信エラー:', error);
      return false;
    }
  }

  /**
   * パスワードリセットメール
   */
  async sendPasswordReset(email: string, resetUrl: string, userName: string = 'ユーザー'): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>パスワードリセット - HOGUSY</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #00C896 0%, #00A078 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: -1px;">HOGUSY</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">Wellness Platform</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 24px; font-weight: 800;">パスワードリセットのご案内</h2>
              <p style="margin: 0 0 24px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                ${userName} 様
              </p>
              <p style="margin: 0 0 24px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                パスワードのリセットをリクエストされました。<br>
                下記のボタンをクリックして、新しいパスワードを設定してください。
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #00C896 0%, #00A078 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 16px; font-weight: 800; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(0,200,150,0.3);">
                      パスワードをリセット
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                このリンクは<strong>1時間</strong>有効です。<br>
                リクエストに心当たりがない場合は、このメールを無視してください。
              </p>
              
              <div style="margin-top: 32px; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #00C896;">
                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                  <strong>ボタンが機能しない場合は、下記のURLをコピーしてブラウザに貼り付けてください：</strong><br>
                  <a href="${resetUrl}" style="color: #00C896; word-break: break-all; text-decoration: none;">${resetUrl}</a>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 16px 16px;">
              <p style="margin: 0 0 8px 0; color: #999999; font-size: 12px;">
                本メールは HOGUSY から自動送信されています。<br>
                このメールに返信することはできません。
              </p>
              <p style="margin: 8px 0 0 0; color: #cccccc; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                HOGUSY | Powered by CHARGE
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.send({
      to: email,
      subject: '【HOGUSY】パスワードリセットのご案内',
      html,
    });
  }

  /**
   * 予約確認メール
   */
  async sendBookingConfirmation(
    email: string,
    userName: string,
    therapistName: string,
    scheduledAt: string,
    serviceName: string,
    price: number
  ): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>予約確認 - HOGUSY</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px;">
          <tr>
            <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #00C896 0%, #00A078 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 900;">HOGUSY</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 24px;">ご予約ありがとうございます</h2>
              <p style="margin: 0 0 24px 0; color: #666666; font-size: 16px;">
                ${userName} 様、ご予約を承りました。
              </p>
              <table width="100%" style="border: 1px solid #e0e0e0; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px; background-color: #f9f9f9; font-weight: bold;">セラピスト</td>
                  <td style="padding: 16px;">${therapistName}</td>
                </tr>
                <tr>
                  <td style="padding: 16px; background-color: #f9f9f9; font-weight: bold;">日時</td>
                  <td style="padding: 16px;">${scheduledAt}</td>
                </tr>
                <tr>
                  <td style="padding: 16px; background-color: #f9f9f9; font-weight: bold;">サービス</td>
                  <td style="padding: 16px;">${serviceName}</td>
                </tr>
                <tr>
                  <td style="padding: 16px; background-color: #f9f9f9; font-weight: bold;">料金</td>
                  <td style="padding: 16px;">¥${price.toLocaleString()}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 16px 16px;">
              <p style="margin: 0; color: #999999; font-size: 12px;">HOGUSY | Powered by CHARGE</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.send({
      to: email,
      subject: '【HOGUSY】ご予約確認',
      html,
    });
  }

  /**
   * 予約リマインダーメール
   */
  async sendBookingReminder(
    email: string,
    userName: string,
    therapistName: string,
    scheduledAt: string
  ): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>予約リマインダー - HOGUSY</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px;">
          <tr>
            <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #5B4FFF 0%, #4839CC 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 900;">HOGUSY</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">予約リマインダー</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 24px;">まもなく施術のお時間です</h2>
              <p style="margin: 0 0 24px 0; color: #666666; font-size: 16px;">
                ${userName} 様、ご予約のリマインダーです。
              </p>
              <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #5B4FFF;">
                <p style="margin: 0; color: #1a1a1a; font-size: 18px; font-weight: bold;">${therapistName}</p>
                <p style="margin: 8px 0 0 0; color: #666666; font-size: 16px;">${scheduledAt}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 16px 16px;">
              <p style="margin: 0; color: #999999; font-size: 12px;">HOGUSY | Powered by CHARGE</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.send({
      to: email,
      subject: '【HOGUSY】予約リマインダー - まもなく施術のお時間です',
      html,
    });
  }
}
