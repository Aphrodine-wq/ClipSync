# Architecture Diagrams

## System Architecture

```mermaid
graph TB
    subgraph Clients
        A[Web App]
        B[Desktop App]
        C[Mobile App]
        D[Browser Extension]
        E[CLI Tool]
    end
    
    subgraph Backend
        F[Express API]
        G[Socket.IO]
        H[Background Jobs]
    end
    
    subgraph Data Layer
        I[(PostgreSQL)]
        J[(Redis)]
    end
    
    subgraph External
        K[Stripe]
        L[OAuth Providers]
        M[Email Service]
    end
    
    A --> F
    B --> F
    C --> F
    D --> F
    E --> F
    
    A --> G
    B --> G
    C --> G
    
    F --> I
    F --> J
    H --> I
    
    F --> K
    F --> L
    F --> M
```

## Data Flow - Clipboard Sync

```mermaid
sequenceDiagram
    participant Device1
    participant Backend
    participant Socket.IO
    participant Device2
    participant Database
    
    Device1->>Database: Create Clip
    Device1->>Socket.IO: Emit clip:created
    Socket.IO->>Device2: Broadcast clip:created
    Device2->>Backend: Fetch new clip
    Backend->>Database: Get clip data
    Backend->>Device2: Return clip
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant OAuth
    
    User->>Frontend: Click Sign In
    Frontend->>OAuth: Redirect to Google
    User->>OAuth: Authenticate
    OAuth->>Backend: Callback with token
    Backend->>Backend: Verify token
    Backend->>Backend: Create/Update user
    Backend->>Frontend: Return JWT
    Frontend->>Frontend: Store token
```

## Payment Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Stripe
    
    User->>Frontend: Select Plan
    Frontend->>Backend: Create checkout session
    Backend->>Stripe: Create session
    Stripe->>User: Checkout page
    User->>Stripe: Complete payment
    Stripe->>Backend: Webhook (checkout.completed)
    Backend->>Backend: Update subscription
    Backend->>User: Confirm subscription
```

---

See [SYSTEM-OVERVIEW.md](SYSTEM-OVERVIEW.md) for detailed architecture documentation.

