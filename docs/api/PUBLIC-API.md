# ClipSync Public API Documentation

## Overview

The ClipSync Public API provides programmatic access to your clipboard data via RESTful endpoints. All requests require API key authentication.

## Base URL

```
https://api.clipsync.com/api/v1
```

## Authentication

All API requests must include an API key in one of the following ways:

### Header (Recommended)
```
Authorization: Bearer clipsync_your_api_key_here
```

Or:
```
X-API-Key: clipsync_your_api_key_here
```

### Query Parameter
```
GET /api/v1/clips?api_key=clipsync_your_api_key_here
```

## Rate Limits

- Default: 1000 requests per hour per API key
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

## Endpoints

### Get Clips

```http
GET /clips
```

Query Parameters:
- `limit` (optional): Number of clips to return (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `type` (optional): Filter by type (text, code, json, etc.)
- `search` (optional): Search clips by content

Response:
```json
{
  "clips": [
    {
      "id": "uuid",
      "content": "clip content",
      "type": "text",
      "pinned": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "limit": 50,
  "offset": 0
}
```

### Create Clip

```http
POST /clips
```

Body:
```json
{
  "content": "clip content",
  "type": "text"
}
```

Response:
```json
{
  "clip": {
    "id": "uuid",
    "content": "clip content",
    "type": "text",
    "pinned": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Get Single Clip

```http
GET /clips/:id
```

### Delete Clip

```http
DELETE /clips/:id
```

### API Keys Management

```http
GET /keys        # List API keys
POST /keys       # Create API key
DELETE /keys/:id # Delete API key
```

### Webhooks Management

```http
GET /webhooks        # List webhooks
POST /webhooks       # Create webhook
DELETE /webhooks/:id # Delete webhook
```

## Webhooks

Webhooks allow you to receive real-time notifications when events occur in your ClipSync account.

### Supported Events

- `clip.created` - New clip created
- `clip.updated` - Clip updated
- `clip.deleted` - Clip deleted

### Webhook Payload

```json
{
  "event": "clip.created",
  "data": {
    "id": "uuid",
    "content": "clip content",
    "type": "text"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Webhook Signature

Each webhook request includes a signature header:
```
X-ClipSync-Signature: sha256=...
```

Verify signatures using HMAC SHA-256 with your webhook secret.

## Error Responses

```json
{
  "error": "Error type",
  "message": "Human-readable error message"
}
```

Status Codes:
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

