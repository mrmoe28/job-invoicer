import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/drizzle-db';
import { payments, invoices } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Initialize Stripe with better error handling
const getStripeInstance = () => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeKey || stripeKey === 'sk_test_dummy_key' || stripeKey.length < 20) {
    console.log('Stripe webhook - payment processing not configured');
    return null;
  }
  
  try {
    return new Stripe(stripeKey, {
      apiVersion: '2025-05-28.basil',
    });
  } catch (error) {
    console.error('Failed to initialize Stripe for webhook:', error);
    return null;
  }
};

export async function POST(req: NextRequest) {
  const stripe = getStripeInstance();
  
  // Check if webhook is properly configured
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET === 'whsec_dummy_secret') {
    console.log('Stripe webhook not configured - returning success to avoid errors');
    return NextResponse.json({ 
      received: true,
      message: 'Webhook acknowledged (Stripe not configured)'
    });
  }

  const sig = req.headers.get('stripe-signature') as string;
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Create payment record
      const newPayment = {
        id: nanoid(),
        stripePaymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert from cents
        status: 'Paid',
        paymentDate: new Date(),
        paymentMethod: paymentIntent.payment_method_types[0],
        customerName: paymentIntent.metadata?.customerName || 'Stripe Customer',
        invoiceId: paymentIntent.metadata?.invoiceId || null,
        invoiceNumber: paymentIntent.metadata?.invoiceNumber || null,
        description: paymentIntent.description || null,
        userId: paymentIntent.metadata?.userId || 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.insert(payments).values(newPayment);

      // Update invoice status if linked
      if (paymentIntent.metadata?.invoiceId) {
        await db
          .update(invoices)
          .set({
            status: 'Paid',
            updatedAt: new Date()
          })
          .where(eq(invoices.id, paymentIntent.metadata.invoiceId));
      }
      
      console.log('Payment recorded:', paymentIntent.id);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.error('Payment failed:', failedPayment.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
