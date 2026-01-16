/**
 * Webhook Delivery Service
 * Handles webhook delivery and retries
 */

import { query } from '../config/database.js';
import crypto from 'crypto';

/**
 * Trigger webhook for event
 */
export async function triggerWebhook(userId, eventType, payload) {
  try {
    // Find active webhooks for user that listen to this event
    const result = await query(
      `SELECT id, url, secret, events
       FROM webhooks
       WHERE user_id = $1 
         AND is_active = TRUE
         AND $2 = ANY(events)`,
      [userId, eventType]
    );

    const webhooks = result.rows;

    // Deliver to each webhook
    for (const webhook of webhooks) {
      await deliverWebhook(webhook, eventType, payload);
    }
  } catch (error) {
    console.error('Webhook trigger error:', error);
  }
}

/**
 * Deliver webhook to URL
 */
async function deliverWebhook(webhook, eventType, payload) {
  const deliveryId = await createDelivery(webhook.id, eventType, payload);

  try {
    // Sign payload
    const signature = signPayload(JSON.stringify(payload), webhook.secret);

    // Send HTTP POST request
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ClipSync-Event': eventType,
        'X-ClipSync-Signature': signature,
        'X-ClipSync-Delivery': deliveryId,
      },
      body: JSON.stringify({
        event: eventType,
        data: payload,
        timestamp: new Date().toISOString(),
      }),
    });

    // Update delivery status
    if (response.ok) {
      await updateDelivery(deliveryId, 'success', response.status, await response.text());
      await updateWebhookStats(webhook.id, true);
    } else {
      await updateDelivery(
        deliveryId,
        'failed',
        response.status,
        await response.text()
      );
      await updateWebhookStats(webhook.id, false);

      // Retry if failed (up to 3 times)
      await retryWebhook(webhook, eventType, payload, deliveryId, 1);
    }
  } catch (error) {
    console.error('Webhook delivery error:', error);
    await updateDelivery(deliveryId, 'failed', null, null, error.message);
    await updateWebhookStats(webhook.id, false);
    await retryWebhook(webhook, eventType, payload, deliveryId, 1);
  }
}

/**
 * Retry webhook delivery
 */
async function retryWebhook(webhook, eventType, payload, deliveryId, attempt) {
  if (attempt > 3) {
    return; // Max retries
  }

  // Exponential backoff: 1s, 2s, 4s
  const delay = Math.pow(2, attempt) * 1000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  try {
    const signature = signPayload(JSON.stringify(payload), webhook.secret);

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ClipSync-Event': eventType,
        'X-ClipSync-Signature': signature,
        'X-ClipSync-Delivery': deliveryId,
      },
      body: JSON.stringify({
        event: eventType,
        data: payload,
        timestamp: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      await updateDelivery(deliveryId, 'success', response.status, await response.text());
      await updateWebhookStats(webhook.id, true);
    } else {
      await updateDelivery(deliveryId, 'failed', response.status, await response.text());
      await updateWebhookStats(webhook.id, false);
      await retryWebhook(webhook, eventType, payload, deliveryId, attempt + 1);
    }
  } catch (error) {
    await updateDelivery(deliveryId, 'failed', null, null, error.message);
    await updateWebhookStats(webhook.id, false);
    await retryWebhook(webhook, eventType, payload, deliveryId, attempt + 1);
  }
}

/**
 * Sign payload with webhook secret
 */
function signPayload(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

/**
 * Create webhook delivery record
 */
async function createDelivery(webhookId, eventType, payload) {
  const result = await query(
    `INSERT INTO webhook_deliveries (webhook_id, event_type, payload, status)
     VALUES ($1, $2, $3, 'pending')
     RETURNING id`,
    [webhookId, eventType, JSON.stringify(payload)]
  );

  return result.rows[0].id;
}

/**
 * Update delivery status
 */
async function updateDelivery(deliveryId, status, responseCode, responseBody, errorMessage) {
  await query(
    `UPDATE webhook_deliveries
     SET status = $1,
         response_code = $2,
         response_body = $3,
         error_message = $4,
         attempts = attempts + 1,
         delivered_at = CASE WHEN $1 = 'success' THEN CURRENT_TIMESTAMP ELSE delivered_at END
     WHERE id = $5`,
    [status, responseCode, responseBody, errorMessage, deliveryId]
  );
}

/**
 * Update webhook statistics
 */
async function updateWebhookStats(webhookId, success) {
  if (success) {
    await query(
      `UPDATE webhooks
       SET success_count = success_count + 1,
           last_triggered_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [webhookId]
    );
  } else {
    await query(
      `UPDATE webhooks
       SET failure_count = failure_count + 1,
           last_triggered_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [webhookId]
    );
  }
}

