interface PayPalPaymentData {
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  billingInterval: 'monthly' | 'yearly';
  userEmail: string;
  userId?: string;
}

interface PayPalResponse {
  success: boolean;
  paymentId?: string;
  error?: string;
  redirectUrl?: string;
}

class PayPalService {
  private paypalEmail = 'infouserge@gmail.com';
  private apiUrl = 'https://api-m.sandbox.paypal.com'; // Use 'https://api-m.paypal.com' for production
  private clientId = (import.meta.env?.VITE_PAYPAL_CLIENT_ID as string) || 'Ae1W8tycyzeSJdYBYA8ValWLDE939vSvnFg6KnNVb5y5DJ0-gXwFDjmE8w2P4oNotUm32YPTginRVRz7';
  private clientSecret = (import.meta.env?.VITE_PAYPAL_CLIENT_SECRET as string) || 'Ae1W8tycyzeSJdYBYA8ValWLDE939vSvnFg6KnNVb5y5DJ0-gXwFDjmE8w2P4oNotUm32YPTginRVRz7';

  // Track payment attempts and successful payments
  private paymentAttempts = new Map<string, number>();
  private successfulPayments = new Map<string, boolean>();

  async createPayment(paymentData: PayPalPaymentData): Promise<PayPalResponse> {
    try {
      // Check if user has already paid for this plan
      const paymentKey = `${paymentData.userEmail}-${paymentData.planId}`;
      if (this.successfulPayments.get(paymentKey)) {
        return {
          success: false,
          error: 'Payment already completed for this plan'
        };
      }

      // Track payment attempt
      const attempts = this.paymentAttempts.get(paymentKey) || 0;
      this.paymentAttempts.set(paymentKey, attempts + 1);

      // Create PayPal order
      const order = await this.createPayPalOrder(paymentData);
      
      if (order.success && order.redirectUrl) {
        // Store payment data in localStorage for verification
        localStorage.setItem('pendingPayment', JSON.stringify({
          ...paymentData,
          paypalOrderId: order.paymentId,
          timestamp: Date.now()
        }));

        return {
          success: true,
          paymentId: order.paymentId,
          redirectUrl: order.redirectUrl
        };
      }

      return {
        success: false,
        error: order.error || 'Failed to create PayPal payment'
      };

    } catch (error) {
      console.error('PayPal payment error:', error);
      return {
        success: false,
        error: 'Payment service temporarily unavailable'
      };
    }
  }

  private async createPayPalOrder(paymentData: PayPalPaymentData) {
    try {
      // For demo purposes, we'll create a mock PayPal order
      // In production, you would integrate with PayPal's API
      
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate PayPal API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        paymentId: orderId,
        redirectUrl: `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${this.paypalEmail}&item_name=${paymentData.planName}&amount=${paymentData.amount}&currency_code=${paymentData.currency}&return=${window.location.origin}/payment/success&cancel_return=${window.location.origin}/payment/cancel&notify_url=${window.location.origin}/api/webhooks/paypal`
      };

    } catch (error) {
      console.error('PayPal order creation error:', error);
      return {
        success: false,
        error: 'Failed to create PayPal order'
      };
    }
  }

  async verifyPayment(paymentId: string): Promise<boolean> {
    try {
      // In production, verify with PayPal's API
      // For demo, we'll simulate verification
      
      const pendingPayment = localStorage.getItem('pendingPayment');
      if (!pendingPayment) return false;

      const paymentData = JSON.parse(pendingPayment);
      
      // Simulate PayPal verification
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mark payment as successful
      const paymentKey = `${paymentData.userEmail}-${paymentData.planId}`;
      this.successfulPayments.set(paymentKey, true);
      
      // Clear pending payment
      localStorage.removeItem('pendingPayment');

      // Store successful payment in database (in production)
      await this.storeSuccessfulPayment(paymentData, paymentId);

      return true;

    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  private async storeSuccessfulPayment(paymentData: PayPalPaymentData, paymentId: string) {
    try {
      // In production, store in your database
      const paymentRecord = {
        paymentId,
        userEmail: paymentData.userEmail,
        userId: paymentData.userId,
        planId: paymentData.planId,
        planName: paymentData.planName,
        amount: paymentData.amount,
        currency: paymentData.currency,
        billingInterval: paymentData.billingInterval,
        paypalEmail: this.paypalEmail,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };

      // Store in localStorage for demo (replace with database call)
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');
      payments.push(paymentRecord);
      localStorage.setItem('payments', JSON.stringify(payments));

      console.log('Payment stored:', paymentRecord);

    } catch (error) {
      console.error('Error storing payment:', error);
    }
  }

  // Get payment history for a user
  getPaymentHistory(userEmail: string) {
    try {
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');
      return payments.filter((payment: any) => payment.userEmail === userEmail);
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  // Check if user has active subscription
  hasActiveSubscription(userEmail: string, planId: string): boolean {
    const paymentKey = `${userEmail}-${planId}`;
    return this.successfulPayments.get(paymentKey) || false;
  }

  // Get payment attempts for a user
  getPaymentAttempts(userEmail: string, planId: string): number {
    const paymentKey = `${userEmail}-${planId}`;
    return this.paymentAttempts.get(paymentKey) || 0;
  }

  // Reset payment attempts (for testing)
  resetPaymentAttempts(userEmail: string, planId: string) {
    const paymentKey = `${userEmail}-${planId}`;
    this.paymentAttempts.delete(paymentKey);
    this.successfulPayments.delete(paymentKey);
  }
}

export const paypalService = new PayPalService();