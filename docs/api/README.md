# API Documentation

This folder contains API documentation for ClipSync.

## Contents

- **[API.md](./API.md)** - Complete API reference with all endpoints

## API Base URLs

- **Development**: `http://localhost:3001/api`
- **Production**: `https://api.clipsync.com/api`

## Authentication

All API requests (except public share links) require authentication via JWT token:

```
Authorization: Bearer <JWT_TOKEN>
```

## Quick Reference

- [Authentication Endpoints](./API.md#authentication)
- [Clip Endpoints](./API.md#clips)
- [Team Endpoints](./API.md#teams)
- [User Data Endpoints](./API.md#user-data-gdpr)

## Rate Limits

- General: 100 requests per 15 minutes
- Strict (auth/shares): 20 requests per 15 minutes
- Per-user: 1000 requests per hour

