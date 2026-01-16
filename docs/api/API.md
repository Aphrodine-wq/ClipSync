# API Documentation

ClipSync REST API documentation.

## Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://api.clipsync.com`

## Authentication

All API endpoints (except `/api/auth`) require authentication via JWT token.

### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

## Endpoints

### Authentication

#### `POST /api/auth/google`
Google OAuth authentication.

**Request Body:**
```json
{
  "token": "google-id-token",
  "deviceName": "Chrome Browser",
  "deviceType": "browser",
  "totpToken": "123456" // Optional, required if 2FA enabled
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://...",
    "plan": "free",
    "twoFactorEnabled": false
  }
}
```

#### `GET /api/auth/me`
Get current user information.

**Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://...",
  "plan": "free"
}
```

### 2FA

#### `GET /api/auth/2fa/status`
Get 2FA status.

#### `POST /api/auth/2fa/setup`
Generate TOTP secret and QR code.

#### `POST /api/auth/2fa/enable`
Enable 2FA.

**Request Body:**
```json
{
  "secret": "totp-secret",
  "token": "123456"
}
```

#### `POST /api/auth/2fa/disable`
Disable 2FA.

**Request Body:**
```json
{
  "token": "123456"
}
```

### Devices

#### `GET /api/devices`
Get all user devices.

#### `DELETE /api/devices/:id`
Revoke a device.

#### `POST /api/devices/revoke-all`
Revoke all other devices.

#### `GET /api/devices/sessions`
Get active session count.

### Clips

#### `GET /api/clips`
Get user clips.

**Query Parameters:**
- `limit`: Number of clips (default: 50)
- `offset`: Pagination offset (default: 0)
- `type`: Filter by type
- `pinned`: Filter pinned clips (true/false)
- `folderId`: Filter by folder
- `tag`: Filter by tag

**Response:**
```json
{
  "clips": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

#### `POST /api/clips`
Create a new clip.

**Request Body:**
```json
{
  "content": "clip content",
  "type": "text",
  "tags": ["tag1", "tag2"],
  "folderId": "folder-id",
  "encrypted": false,
  "pinned": false,
  "metadata": {}
}
```

#### `GET /api/clips/:id`
Get a specific clip.

#### `PUT /api/clips/:id`
Update a clip.

#### `DELETE /api/clips/:id`
Delete a clip.

### Tags

#### `GET /api/tags`
Get all user tags.

#### `POST /api/tags`
Create a tag.

#### `DELETE /api/tags/:id`
Delete a tag.

### Folders

#### `GET /api/folders`
Get all user folders.

#### `POST /api/folders`
Create a folder.

#### `PUT /api/folders/:id`
Update a folder.

#### `DELETE /api/folders/:id`
Delete a folder.

### Teams

#### `GET /api/teams`
Get user teams.

#### `POST /api/teams`
Create a team.

#### `GET /api/teams/:id`
Get team details.

#### `PUT /api/teams/:id`
Update a team.

#### `DELETE /api/teams/:id`
Delete a team.

### System

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": { "status": "healthy" },
    "redis": { "status": "healthy" }
  }
}
```

#### `GET /metrics`
Get performance metrics.

#### `GET /monitoring`
Get comprehensive monitoring data.

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error",
  "message": "Invalid input",
  "code": "VALIDATION_ERROR"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "Invalid or expired token",
  "code": "UNAUTHORIZED"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied",
  "message": "Insufficient permissions",
  "code": "FORBIDDEN"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Resource not found",
  "code": "NOT_FOUND"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded",
  "retryAfter": 60,
  "code": "RATE_LIMIT_EXCEEDED"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred",
  "code": "INTERNAL_ERROR"
}
```

## Rate Limiting

- **General API**: 100 requests/minute per IP
- **Authentication**: 5 requests/minute per IP
- **Rate limit headers**:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## WebSocket Events

### Client → Server

- `clip:create` - Create a clip
- `clip:update` - Update a clip
- `clip:delete` - Delete a clip

### Server → Client

- `clip:created` - Clip created
- `clip:updated` - Clip updated
- `clip:deleted` - Clip deleted
- `connection-status` - Connection status update

## Pagination

All list endpoints support pagination:

- `limit`: Number of items per page (default: 50, max: 100)
- `offset`: Number of items to skip (default: 0)

## Filtering

Many endpoints support filtering:

- `type`: Filter by clip type
- `pinned`: Filter pinned items (true/false)
- `folderId`: Filter by folder
- `tag`: Filter by tag name

## Sorting

- `order`: Sort order (`asc` or `desc`, default: `desc`)
- `sortBy`: Field to sort by (default: `created_at`)

