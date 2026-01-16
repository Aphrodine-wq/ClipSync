/**
 * Stripe Payment Routes
 * Handles subscription management and webhooks
 */

import express from 'express';
import Stripe from 'stripe';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

// Webhook endpoint (no auth required, uses Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Create checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { plan, priceId } = req.body;

    // Get or create Stripe customer
    let customerId = await getStripeCustomerId(req.user.id);
    if (!customerId) {
      customerId = await createStripeCustomer(req.user);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId || getPriceIdForPlan(plan),
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
      metadata: {
        userId: req.user.id,
        plan,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create billing portal session
router.post('/create-portal-session', authenticateToken, async (req, res) => {
  try {
    const customerId = await getStripeCustomerId(req.user.id);
    if (!customerId) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/billing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Get subscription status
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ subscription: null });
    }

    const subscription = result.rows[0];

    // Get latest subscription from Stripe
    if (subscription.stripe_subscription_id) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );
        subscription.stripeData = {
          status: stripeSubscription.status,
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        };
      } catch (error) {
        console.error('Failed to fetch Stripe subscription:', error);
      }
    }

    res.json({ subscription });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0 || !result.rows[0].stripe_subscription_id) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const subscriptionId = result.rows[0].stripe_subscription_id;

    // Cancel at period end
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update database
    await query(
      'UPDATE subscriptions SET cancel_at_period_end = true WHERE user_id = $1',
      [req.user.id]
    );

    res.json({ success: true, message: 'Subscription will be canceled at period end' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Webhook handlers
async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId;
  const plan = session.metadata.plan;

  // Get subscription
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  // Update or create subscription record
  await query(
    `INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_start, current_period_end)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (user_id) DO UPDATE
     SET stripe_subscription_id = $3, plan = $4, status = $5, current_period_start = $6, current_period_end = $7, updated_at = CURRENT_TIMESTAMP`,
    [
      userId,
      subscription.customer,
      subscription.id,
      plan,
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
    ]
  );

  // Update user plan
  await query('UPDATE users SET plan = $1 WHERE id = $2', [plan, userId]);
}

async function handleSubscriptionUpdated(subscription) {
  await query(
    `UPDATE subscriptions 
     SET status = $1, current_period_start = $2, current_period_end = $3, cancel_at_period_end = $4, updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $5`,
    [
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
      subscription.cancel_at_period_end,
      subscription.id,
    ]
  );

  // Update user plan if canceled
  if (subscription.status === 'canceled' || subscription.cancel_at_period_end) {
    const result = await query(
      'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
      [subscription.id]
    );
    if (result.rows.length > 0) {
      await query('UPDATE users SET plan = $1 WHERE id = $2', [
        'free',
        result.rows[0].user_id,
      ]);
    }
  }
}

async function handleSubscriptionDeleted(subscription) {
  await query(
    'UPDATE subscriptions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE stripe_subscription_id = $2',
    ['canceled', subscription.id]
  );

  const result = await query(
    'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
    [subscription.id]
  );
  if (result.rows.length > 0) {
    await query('UPDATE users SET plan = $1 WHERE id = $2', [
      'free',
      result.rows[0].user_id,
    ]);
  }
}

async function handlePaymentSucceeded(invoice) {
  // Update subscription period
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    await query(
      `UPDATE subscriptions 
       SET current_period_start = $1, current_period_end = $2, updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $3`,
      [
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        subscription.id,
      ]
    );
  }
}

async function handlePaymentFailed(invoice) {
  // Notify user of payment failure
  console.log('Payment failed for invoice:', invoice.id);
  // In production, send email notification
}

// Helper functions
async function getStripeCustomerId(userId) {
  const result = await query(
    'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1',
    [userId]
  );
  return result.rows.length > 0 ? result.rows[0].stripe_customer_id : null;
}

async function createStripeCustomer(user) {
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user.id,
    },
  });

  // Store customer ID
  await query(
    `INSERT INTO subscriptions (user_id, stripe_customer_id, plan, status)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET stripe_customer_id = $2`,
    [user.id, customer.id, 'free', 'active']
  );

  return customer.id;
}

function getPriceIdForPlan(plan) {
  const priceIds = {
    pro: process.env.STRIPE_PRICE_ID_PRO,
    team: process.env.STRIPE_PRICE_ID_TEAM,
    enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE,
  };
  return priceIds[plan] || priceIds.pro;
}

export default router;

