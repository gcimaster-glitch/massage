
/**
 * Soothe Stripe Payment Service
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8787/api';

export const stripeService = {
  /**
   * 予約用のStripe Checkout Sessionを作成してリダイレクト
   */
  async createCheckoutSession(bookingData: any) {
    try {
      const response = await fetch(`${API_BASE}/payments/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) throw new Error('Payment session creation failed');

      const { checkoutUrl } = await response.json();
      
      // Stripeの決済画面へリダイレクト
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Stripe redirect error:', error);
      throw error;
    }
  },

  /**
   * 支払い成功後の検証（Webhook待ちの間にフロントでステータス確認）
   */
  async verifyPayment(sessionId: string) {
    const response = await fetch(`${API_BASE}/payments/verify/${sessionId}`);
    return response.json();
  }
};
