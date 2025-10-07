import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { logActivity } from '@/lib/activity/logger';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription' && session.customer) {
          const customerId = session.customer as string;
          const customerEmail = session.customer_email;

          if (customerEmail) {
            // Update user with Stripe customer ID
            const { data: userData } = await supabase
              .from('users')
              .update({
                stripe_customer_id: customerId,
              })
              .eq('email', customerEmail)
              .select('id')
              .single();

            // Log subscription creation activity
            if (userData) {
              await logActivity(userData.id, 'subscription_created', {
                customer_id: customerId,
                plan_name: 'Premium',
              });
            }
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get the subscription details
        const status = subscription.status;
        const planName =
          subscription.items.data[0]?.price.nickname || 'Premium';

        // Update user subscription info
        const { data: userData } = await supabase
          .from('users')
          .update({
            stripe_subscription_id: subscription.id,
            plan_name: planName,
            subscription_status: status,
          })
          .eq('stripe_customer_id', customerId)
          .select('id')
          .single();

        // Log subscription activity
        if (userData) {
          const activityType =
            event.type === 'customer.subscription.created'
              ? 'subscription_created'
              : 'subscription_updated';
          await logActivity(userData.id, activityType, {
            subscription_id: subscription.id,
            plan_name: planName,
            status: status,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Update user to remove subscription
        const { data: userData } = await supabase
          .from('users')
          .update({
            stripe_subscription_id: null,
            plan_name: null,
            subscription_status: 'cancelled',
          })
          .eq('stripe_customer_id', customerId)
          .select('id')
          .single();

        // Log subscription cancellation activity
        if (userData) {
          await logActivity(userData.id, 'subscription_cancelled', {
            subscription_id: subscription.id,
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
