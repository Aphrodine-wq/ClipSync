# Webhooks Documentation

## Overview

ClipSync webhooks allow you to receive real-time notifications when events occur in your account.

## Configuration

### Create a Webhook

```http
POST /api/v1/webhooks
Authorization: Bearer your_api_key
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": ["clip.created", "clip.updated", "clip.deleted"]
}
```

Response:
```json
{
  "webhook": {
    "id": "uuid",
    "url": "https://your-server.com/webhook",
    "events": ["clip.created", "clip.updated"],
    "secret": "webhook_secret_for_signing",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Supported Events

- `clip.created` - New clip created
- `clip.updated` - Clip updated
- `clip.deleted` - Clip deleted
- `clip.pinned` - Clip pinned
- `team.clip.created` - Team clip created
- `team.clip.updated` - Team clip updated

## Webhook Payload

Each webhook request includes:

```json
{
  "event": "clip.created",
  "data": {
    "id": "uuid",
    "content": "clip content",
    "type": "text",
    "user_id": "uuid"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Signature Verification

Each webhook includes a signature header:

```
X-ClipSync-Signature: sha256=...
```

### Verify Signature (Node.js)

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expected = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature.replace('sha256=', '')),
    Buffer.from(expected)
  );
}
```

### Verify Signature (Python)

```python
import hmac
import hashlib

def verify_signature(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(
        signature.replace('sha256=', ''),
        expected
    )
```

## Retry Logic

Webhooks are retried automatically:
- **Attempts**: Up to 3 retries
- **Backoff**: Exponential (1s, 2s, 4s)
- **Success**: Marked as delivered
- **Failure**: Marked as failed after all retries

## Webhook Delivery Status

Check delivery status:

```http
GET /api/v1/webhooks/:id/deliveries
```

## Best Practices

1. **Verify Signatures**: Always verify webhook signatures
2. **Idempotency**: Handle duplicate webhooks gracefully
3. **Timeout**: Respond within 5 seconds
4. **Status Codes**: Return 2xx for success, 4xx/5xx for errors
5. **Logging**: Log all webhook deliveries for debugging

## Example Webhook Handler

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.raw({ type: 'application/json' }));

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-clipsync-signature'];
  const secret = process.env.WEBHOOK_SECRET;
  
  // Verify signature
  if (!verifySignature(req.body, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(req.body);
  
  // Handle event
  switch (event.event) {
    case 'clip.created':
      handleClipCreated(event.data);
      break;
    // ... other events
  }
  
  res.status(200).send('OK');
});
```

