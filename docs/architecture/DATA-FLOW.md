# ClipSync Data Flow Diagrams

This document provides detailed data flow diagrams for all major operations in ClipSync.

## Clipboard Synchronization Flow

```mermaid
sequenceDiagram
    participant User
    participant Monitor as Clipboard Monitor
    participant Frontend
    participant API
    participant Auth as Auth Middleware
    participant Validator as Validation
    participant DB as PostgreSQL
    participant Cache as Redis
    participant PubSub as Redis Pub/Sub
    participant WS as WebSocket Server
    participant Device2 as Other Device
    
    User->>Monitor: Copy text (Ctrl+C)
    Monitor->>Frontend: Clipboard change event
    Frontend->>Frontend: Validate content
    Frontend->>Frontend: Check duplicates
    Frontend->>Frontend: Store in IndexedDB
    
    Frontend->>API: POST /api/clips
    API->>Auth: Verify JWT token
    Auth-->>API: Authenticated
    API->>Validator: Validate request body
    Validator-->>API: Valid
    
    API->>API: Detect sensitive data
    alt Sensitive Data
        API->>API: Encrypt (AES-256-GCM)
    end
    
    API->>DB: INSERT INTO clips
    DB-->>API: Clip created
    
    API->>Cache: Invalidate user cache
    API->>PubSub: Publish 'clip:created'
    PubSub->>WS: Broadcast event
    WS->>Device2: Real-time update
    Device2->>Device2: Update IndexedDB
    Device2->>Device2: Update UI
    
    API-->>Frontend: 201 Created
    Frontend->>Frontend: Update UI
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Google
    participant API
    participant DB as PostgreSQL
    participant Redis
    participant WS as WebSocket
    
    User->>Frontend: Click "Sign In with Google"
    Frontend->>Google: Initiate OAuth 2.0
    Google->>User: Show consent screen
    User->>Google: Grant permissions
    Google->>Frontend: Redirect with code
    
    Frontend->>API: POST /api/auth/google { code }
    API->>Google: Verify code, exchange token
    Google-->>API: User info + access token
    
    API->>DB: SELECT user WHERE google_id
    alt User Exists
        API->>DB: UPDATE last_login
    else New User
        API->>DB: INSERT user
    end
    
    API->>DB: INSERT login_attempt (success)
    API->>API: Generate JWT token
    API->>API: Generate refresh token
    API->>DB: INSERT user_session
    API->>Redis: Store session data
    
    API-->>Frontend: { token, refreshToken, user }
    Frontend->>Frontend: Store in secure cookie
    Frontend->>WS: Connect with token
    WS->>API: Verify token
    API-->>WS: Authenticated
    WS->>WS: Join user room
```

## Team Collaboration Flow

```mermaid
sequenceDiagram
    participant Owner
    participant Member
    participant Frontend1
    participant Frontend2
    participant API
    participant DB
    participant WS
    
    Owner->>Frontend1: Create team
    Frontend1->>API: POST /api/teams
    API->>DB: INSERT team
    API->>DB: INSERT team_member (owner)
    API-->>Frontend1: Team created
    
    Owner->>Frontend1: Invite member
    Frontend1->>API: POST /api/teams/:id/invites
    API->>DB: Create invite
    API->>WS: Notify member (if online)
    
    Member->>Frontend2: Accept invite
    Frontend2->>API: POST /api/teams/:id/join
    API->>DB: INSERT team_member
    API->>WS: Broadcast 'member-added'
    WS->>Frontend1: Member joined
    
    Owner->>Frontend1: Share clip
    Frontend1->>API: POST /api/teams/:id/clips
    API->>DB: INSERT team_clip
    API->>WS: Broadcast 'team-clip:created'
    WS->>Frontend1: Clip shared
    WS->>Frontend2: New team clip
    Frontend2->>Frontend2: Update UI
```

## GDPR Data Export Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant ExportService
    participant DB
    participant Encryption
    
    User->>Frontend: Request data export
    Frontend->>API: GET /api/user/export
    API->>API: Authenticate
    API->>ExportService: exportUserData(userId)
    
    ExportService->>DB: SELECT user
    ExportService->>DB: SELECT clips
    ExportService->>DB: SELECT folders
    ExportService->>DB: SELECT tags
    ExportService->>DB: SELECT teams
    ExportService->>DB: SELECT team_clips
    ExportService->>DB: SELECT shares
    ExportService->>DB: SELECT sessions
    ExportService->>DB: SELECT audit_logs (90 days)
    
    loop For each encrypted clip
        ExportService->>Encryption: Decrypt content
        Encryption-->>ExportService: Decrypted content
    end
    
    ExportService->>ExportService: Generate JSON
    ExportService->>API: Return export
    API->>DB: INSERT audit_log (export requested)
    API-->>Frontend: JSON file download
```

## GDPR Data Deletion Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant DeletionService
    participant DB
    participant Scheduler
    
    User->>Frontend: Request deletion
    Frontend->>API: DELETE /api/user/data { confirmation: "DELETE" }
    API->>API: Verify confirmation
    API->>DeletionService: softDeleteUserData(userId)
    
    DeletionService->>DB: UPDATE users SET deleted_at = NOW() + 30 days
    DeletionService->>DB: UPDATE clips SET deleted_at = NOW() + 30 days
    DeletionService->>DB: UPDATE folders SET deleted_at = NOW() + 30 days
    DeletionService->>DB: DELETE FROM team_members
    DeletionService->>DB: DELETE FROM user_sessions
    DeletionService->>DB: INSERT audit_log
    
    DeletionService-->>API: { success, deleteAt }
    API-->>Frontend: Deletion scheduled
    
    Note over Scheduler: After 30 days
    Scheduler->>DeletionService: processScheduledDeletions()
    DeletionService->>DB: SELECT users WHERE deleted_at <= NOW()
    
    loop For each user
        DeletionService->>DB: DELETE clips
        DeletionService->>DB: DELETE folders
        DeletionService->>DB: DELETE tags
        DeletionService->>DB: UPDATE audit_logs SET user_id = NULL
        DeletionService->>DB: DELETE users
    end
```

## Cache Invalidation Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Cache as Redis Cache
    participant DB
    
    User->>Frontend: Update clip
    Frontend->>API: PUT /api/clips/:id
    API->>DB: UPDATE clips
    DB-->>API: Updated
    
    API->>Cache: Invalidate user cache
    Note over Cache: Delete patterns:<br/>clips:user:{userId}:*<br/>clips:list:{userId}:*
    
    API->>Cache: Invalidate clip cache
    Note over Cache: Delete:<br/>clip:{userId}:{clipId}
    
    API-->>Frontend: Updated clip
    Frontend->>Frontend: Update UI
    
    Note over Cache: Next request will<br/>cache miss and<br/>fetch from DB
```

## Background Job Processing Flow

```mermaid
sequenceDiagram
    participant API
    participant Queue as Bull Queue
    participant Worker
    participant DB
    participant Redis
    
    API->>Queue: Add job (analytics, reports)
    Queue->>Redis: Store job
    Redis-->>Queue: Job queued
    
    Worker->>Queue: Get job
    Queue-->>Worker: Job data
    
    Worker->>DB: Process analytics
    DB-->>Worker: Results
    Worker->>DB: Store results
    
    Worker->>Queue: Mark job complete
    Queue->>Redis: Remove job
    
    alt Job Failed
        Worker->>Queue: Mark job failed
        Queue->>Queue: Retry (with backoff)
    end
```

