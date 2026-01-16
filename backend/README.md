# ClipSync Backend

Backend API and WebSocket server for ClipSync - a web-first clipboard manager with real-time sync.

## Features

- 🔐 Google OAuth 2.0 Authentication
- 📋 Clipboard CRUD operations
- 🔄 Real-time WebSocket sync across devices
- 👥 Team collaboration with role-based access
- 🔗 Temporary share links with password protection
- 📊 Activity logging and analytics
- 🗄️ PostgreSQL database with optimized queries

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL 14+
- **Real-time:** Socket.IO
- **Authentication:** Google OAuth 2.0 + JWT
- **Security:** Helmet, bcrypt, rate limiting

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Google OAuth 2.0 credentials

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `FRONTEND_URL` - Frontend URL for CORS

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173` (development)
   - Your production frontend URL
6. Copy Client ID and Client Secret to `.env`

### 4. Set Up Database

#### Using Docker (Recommended)

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d

# Run migrations
npm run db:migrate
```

#### Manual Setup

```bash
# Create database
createdb clipsync

# Run migrations
npm run db:migrate
```

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /api/auth/google` - Login/signup with Google
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `DELETE /api/auth/account` - Delete account

### Clips

- `GET /api/clips` - Get all clips
- `GET /api/clips/:id` - Get single clip
- `POST /api/clips` - Create clip
- `PUT /api/clips/:id` - Update clip
- `PATCH /api/clips/:id/pin` - Toggle pin
- `DELETE /api/clips/:id` - Delete clip
- `POST /api/clips/bulk-delete` - Delete multiple clips
- `GET /api/clips/stats/summary` - Get statistics

### Teams

- `GET /api/teams` - Get all teams
- `GET /api/teams/:teamId` - Get team details
- `POST /api/teams` - Create team
- `PUT /api/teams/:teamId` - Update team
- `DELETE /api/teams/:teamId` - Delete team
- `POST /api/teams/:teamId/members` - Invite member
- `PUT /api/teams/:teamId/members/:memberId` - Update member role
- `DELETE /api/teams/:teamId/members/:memberId` - Remove member
- `POST /api/teams/:teamId/leave` - Leave team
- `GET /api/teams/:teamId/activity` - Get activity log

### Team Clips

- `GET /api/teams/:teamId/clips` - Get team clips
- `GET /api/teams/:teamId/clips/:clipId` - Get single team clip
- `POST /api/teams/:teamId/clips` - Create team clip
- `PUT /api/teams/:teamId/clips/:clipId` - Update team clip
- `DELETE /api/teams/:teamId/clips/:clipId` - Delete team clip
- `GET /api/teams/:teamId/clips/stats/summary` - Get team statistics

### Share Links

- `POST /api/shares` - Create share link
- `GET /api/shares/:shareId` - Get share link (public)
- `POST /api/shares/:shareId/verify` - Verify password
- `GET /api/shares/user/list` - Get user's share links
- `DELETE /api/shares/:shareId` - Delete share link

## WebSocket Events

### Client → Server

- `join-teams` - Join team rooms
- `clip:created` - Notify clip creation
- `clip:updated` - Notify clip update
- `clip:deleted` - Notify clip deletion
- `team-clip:created` - Notify team clip creation
- `team-clip:updated` - Notify team clip update
- `team-clip:deleted` - Notify team clip deletion
- `team:typing` - Typing indicator

### Server → Client

- `clip:created` - Clip created on another device
- `clip:updated` - Clip updated on another device
- `clip:deleted` - Clip deleted on another device
- `team-clip:created` - Team clip created
- `team-clip:updated` - Team clip updated
- `team-clip:deleted` - Team clip deleted
- `team:typing` - User typing in team

## Database Schema

See `db/schema.sql` for the complete database schema.

Main tables:
- `users` - User accounts
- `clips` - Personal clipboard items
- `folders` - Clip organization
- `teams` - Team workspaces
- `team_members` - Team membership
- `team_clips` - Team clipboard items
- `share_links` - Temporary share links
- `devices` - Connected devices
- `activity_log` - Team activity
- `subscriptions` - Payment subscriptions

## Security

- JWT tokens for authentication
- bcrypt for password hashing (share links)
- Helmet for HTTP security headers
- Rate limiting to prevent abuse
- CORS configuration
- SQL injection prevention with parameterized queries
- Input validation

## Development

### Running Tests

```bash
npm test
```

### Database Migrations

```bash
# Run migrations
npm run db:migrate

# Reset database (caution!)
npm run db:reset
```

### Linting

```bash
npm run lint
```

## Deployment

### Environment Variables for Production

Make sure to set these in production:
- `NODE_ENV=production`
- Strong `JWT_SECRET`
- Production database URL
- Production frontend URL
- Google OAuth production credentials

### Recommended Hosting

- **API Server:** Railway, Render, Fly.io, or AWS
- **Database:** Railway, Supabase, or AWS RDS
- **Redis (optional):** Upstash or AWS ElastiCache

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Check connection
psql -U postgres -d clipsync
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Google OAuth Errors

- Verify redirect URIs match exactly
- Check client ID and secret are correct
- Ensure Google+ API is enabled

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
