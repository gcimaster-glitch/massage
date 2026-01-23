/**
 * email-routes.ts: Resendメール通知関連のAPIルート
 * - POST /api/email/booking-confirmation: 予約確認メール送信
 * - POST /api/email/payment-success: 決済成功メール送信
 * - POST /api/email/payment-failed: 決済失敗メール送信
 */

import { Hono } from 'hono';

type Bindings = {
  RESEND_API_KEY: string;
  DB: D1Database;
};

const email = new Hono<{ Bindings: Bindings }>();

/**
 * POST /api/email/booking-confirmation
 * 予約確認メールを送信（ユーザー + セラピスト）
 */
email.post('/booking-confirmation', async (c) => {
  try {
    const { bookingId, userEmail, therapistEmail, bookingDetails } = await c.req.json();

    if (!userEmail || !bookingDetails) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // ユーザー向けメール
    const userEmailContent = {
      from: 'HOGUSY <noreply@hogusy.com>',
      to: userEmail,
      subject: '【HOGUSY】ご予約を承りました',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h1 style="color: #14b8a6; font-size: 28px; margin-bottom: 24px;">ご予約ありがとうございます</h1>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              ${bookingDetails.userName || 'お客様'}様<br><br>
              この度はHOGUSYをご利用いただき、誠にありがとうございます。<br>
              ご予約を承りましたのでご確認ください。
            </p>

            <div style="background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 20px; margin: 24px 0; border-radius: 8px;">
              <h2 style="color: #0f766e; font-size: 18px; margin: 0 0 16px 0;">予約詳細</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">予約番号</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">#${bookingId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">セラピスト</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${bookingDetails.therapistName || '指定なし'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">施設</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${bookingDetails.siteName || '出張'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">日時</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${bookingDetails.scheduledAt || ''}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">所要時間</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${bookingDetails.duration || 0}分</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">料金</td>
                  <td style="padding: 8px 0; color: #14b8a6; font-weight: 700; font-size: 18px;">¥${bookingDetails.price?.toLocaleString() || 0}</td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <a href="https://hogusy.com/app/bookings/${bookingId}" 
                 style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                予約詳細を見る
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 32px; line-height: 1.6;">
              ご不明な点がございましたら、お気軽にお問い合わせください。<br><br>
              HOGUSY カスタマーサポート<br>
              <a href="mailto:support@hogusy.com" style="color: #14b8a6;">support@hogusy.com</a>
            </p>
          </div>
        </div>
      `,
    };

    // セラピスト向けメール（therapistEmailがある場合）
    let therapistEmailResponse = null;
    if (therapistEmail) {
      const therapistEmailContent = {
        from: 'HOGUSY <noreply@hogusy.com>',
        to: therapistEmail,
        subject: '【HOGUSY】新しい予約が入りました',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h1 style="color: #14b8a6; font-size: 28px; margin-bottom: 24px;">新しい予約が入りました</h1>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 8px;">
                <h2 style="color: #92400e; font-size: 18px; margin: 0 0 16px 0;">予約情報</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">予約番号</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">#${bookingId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">お客様</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${bookingDetails.userName || 'お客様'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">日時</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${bookingDetails.scheduledAt || ''}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">所要時間</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${bookingDetails.duration || 0}分</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">施術場所</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${bookingDetails.siteName || '出張'}</td>
                  </tr>
                </table>
              </div>

              <div style="margin-top: 24px;">
                <a href="https://hogusy.com/t/calendar" 
                   style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  スケジュールを確認
                </a>
              </div>
            </div>
          </div>
        `,
      };

      therapistEmailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify(therapistEmailContent),
      });
    }

    // ユーザー向けメール送信
    const userEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify(userEmailContent),
    });

    if (!userEmailResponse.ok) {
      const error = await userEmailResponse.text();
      console.error('❌ User email sending failed:', error);
      return c.json({ error: 'Failed to send user email' }, 500);
    }

    const userResult = await userEmailResponse.json();

    console.log('✅ Booking confirmation emails sent');

    return c.json({
      success: true,
      userEmailId: userResult.id,
      therapistEmailSent: !!therapistEmail,
    });
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /api/email/payment-success
 * 決済成功メール送信
 */
email.post('/payment-success', async (c) => {
  try {
    const { userEmail, bookingId, amount, paymentIntentId } = await c.req.json();

    if (!userEmail || !bookingId || !amount) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const emailContent = {
      from: 'HOGUSY <noreply@hogusy.com>',
      to: userEmail,
      subject: '【HOGUSY】お支払いが完了しました',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background-color: #d1fae5; border-radius: 50%; padding: 16px; margin-bottom: 16px;">
                <span style="font-size: 48px;">✅</span>
              </div>
              <h1 style="color: #059669; font-size: 28px; margin: 0;">お支払いが完了しました</h1>
            </div>

            <div style="background-color: #f0fdfa; padding: 20px; margin: 24px 0; border-radius: 8px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">予約番号</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px; text-align: right;">#${bookingId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">お支払い金額</td>
                  <td style="padding: 8px 0; color: #14b8a6; font-weight: 700; font-size: 20px; text-align: right;">¥${amount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">取引ID</td>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 12px; text-align: right; font-family: monospace;">${paymentIntentId || 'N/A'}</td>
                </tr>
              </table>
            </div>

            <p style="color: #374151; font-size: 14px; line-height: 1.6;">
              お支払いが正常に処理されました。領収書は自動的に発行されます。<br><br>
              ご予約の詳細は予約履歴ページからご確認いただけます。
            </p>

            <div style="margin-top: 24px; text-align: center;">
              <a href="https://hogusy.com/app/bookings/${bookingId}" 
                 style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                予約詳細を見る
              </a>
            </div>
          </div>
        </div>
      `,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailContent),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Payment success email failed:', error);
      return c.json({ error: 'Failed to send email' }, 500);
    }

    const result = await response.json();

    console.log('✅ Payment success email sent');

    return c.json({ success: true, emailId: result.id });
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /api/email/payment-failed
 * 決済失敗メール送信
 */
email.post('/payment-failed', async (c) => {
  try {
    const { userEmail, bookingId, reason } = await c.req.json();

    if (!userEmail || !bookingId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const emailContent = {
      from: 'HOGUSY <noreply@hogusy.com>',
      to: userEmail,
      subject: '【HOGUSY】お支払いの処理に失敗しました',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background-color: #fee2e2; border-radius: 50%; padding: 16px; margin-bottom: 16px;">
                <span style="font-size: 48px;">❌</span>
              </div>
              <h1 style="color: #dc2626; font-size: 28px; margin: 0;">お支払いの処理に失敗しました</h1>
            </div>

            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 24px 0; border-radius: 8px;">
              <p style="color: #991b1b; font-size: 14px; margin: 0;">
                予約番号: <strong>#${bookingId}</strong>
              </p>
              ${reason ? `<p style="color: #991b1b; font-size: 14px; margin: 8px 0 0 0;">理由: ${reason}</p>` : ''}
            </div>

            <p style="color: #374151; font-size: 14px; line-height: 1.6;">
              お支払いの処理中にエラーが発生しました。以下をご確認ください：<br><br>
              • カード情報が正しく入力されているか<br>
              • カードの有効期限が切れていないか<br>
              • カードの利用限度額を超えていないか<br><br>
              問題が解決しない場合は、カスタマーサポートまでお問い合わせください。
            </p>

            <div style="margin-top: 24px; text-align: center;">
              <a href="https://hogusy.com/app/bookings/${bookingId}" 
                 style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                再度お支払いを試す
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 32px; line-height: 1.6;">
              ご不明な点がございましたら、お気軽にお問い合わせください。<br><br>
              HOGUSY カスタマーサポート<br>
              <a href="mailto:support@hogusy.com" style="color: #14b8a6;">support@hogusy.com</a>
            </p>
          </div>
        </div>
      `,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailContent),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Payment failed email failed:', error);
      return c.json({ error: 'Failed to send email' }, 500);
    }

    const result = await response.json();

    console.log('✅ Payment failed email sent');

    return c.json({ success: true, emailId: result.id });
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default email;
