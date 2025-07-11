import Stripe from 'stripe';
import { redirect } from 'next/navigation';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
});

export async function createCheckoutSession({
  priceId,
  email
}: {
  priceId: string;
  email?: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pricing`,
    customer_email: email,
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14
    }
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(customerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard`,
  });
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring'
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days,
    product: typeof price.product === 'object' && 'name' in price.product ? {
      id: price.product.id,
      name: price.product.name,
      description: price.product.description
    } : null
  }));
}