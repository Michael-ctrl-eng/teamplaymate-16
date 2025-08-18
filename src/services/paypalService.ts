import apiClient from '../lib/apiClient';
import { toast } from 'sonner';

interface CreateSubscriptionPayload {
  plan_id: string;
  payment_method: 'paypal';
  billing_cycle: 'monthly' | 'yearly';
}

class PayPalService {
  async createSubscription(payload: CreateSubscriptionPayload) {
    try {
      const response = await apiClient.post('/subscriptions/create', payload);
      return response;
    } catch (error) {
      console.error('Error creating subscription:', error);
      // The error is already handled by the apiClient interceptor, but we can add more specific logic here if needed.
      throw error;
    }
  }

  async confirmSubscription(subscriptionId: string, paypalOrderId: string) {
    try {
      const response = await apiClient.post('/subscriptions/confirm', {
        subscription_id: subscriptionId,
        paypal_order_id: paypalOrderId,
      });
      toast.success('Subscription confirmed successfully!');
      return response;
    } catch (error) {
      console.error('Error confirming subscription:', error);
      throw error;
    }
  }
}

export const paypalService = new PayPalService();