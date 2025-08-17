const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

class PayPalService {
  constructor() {
    this.environment = this.getEnvironment();
    this.client = new checkoutNodeJssdk.core.PayPalHttpClient(this.environment);
  }

  getEnvironment() {
    const clientId = process.env.PAYPAL_CLIENT_ID || 'dummy_client_id';
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'dummy_client_secret';

    if (process.env.NODE_ENV === 'production') {
      return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
    }
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
  }

  async createOrder(plan) {
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: plan.currency,
            value: plan.price.toString(),
          },
          description: plan.name,
        },
      ],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/subscription/success`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
        brand_name: 'TeamPlaymate',
        user_action: 'SUBSCRIBE_NOW',
      },
    });

    try {
      const order = await this.client.execute(request);
      return order.result;
    } catch (err) {
      console.error('Error creating PayPal order:', err);
      throw new Error('Failed to create PayPal order');
    }
  }

  async captureOrder(orderId) {
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const capture = await this.client.execute(request);
      return capture.result;
    } catch (err) {
      console.error('Error capturing PayPal order:', err);
      throw new Error('Failed to capture PayPal order');
    }
  }

  async verifyWebhookSignature(headers, rawBody) {
    const request = new checkoutNodeJssdk.webhooks.WebhookVerifyRequest(headers, rawBody);
    request.path = '/v1/notifications/verify-webhook-signature';
    request.verb = 'POST';

    try {
      const response = await this.client.execute(request);
      return response.result.verification_status === 'SUCCESS';
    } catch (err) {
      console.error('Error verifying PayPal webhook:', err);
      return false;
    }
  }
}

module.exports = { PayPalService };
