# Database Migrations Guide

## Migration Files

Run migrations in order:

1. `schema.sql` - Base schema (users, clips, teams, etc.)
2. `add_rls_policies.sql` - Row-Level Security policies
3. `add_rich_content.sql` - Image and file support
4. `add_spaces.sql` - Clipboard spaces/workspaces
5. `add_collections.sql` - Smart collections
6. `add_macros.sql` - Clipboard macros
7. `add_api_keys.sql` - API keys and webhooks
8. `add_clipboard_shortcuts.sql` - Hotkey assignments
9. `add_comments_reactions.sql` - Comments and reactions

## Running Migrations

### Automatic (Recommended)
```bash
cd backend
npm run db:migrate
```

### Manual
```bash
psql -d clipsync -f backend/db/schema.sql
psql -d clipsync -f backend/db/migrations/add_rls_policies.sql
# ... continue for all migrations
```

## Migration Order

Always run migrations in this order:
1. Base schema first
2. Security policies
3. Feature additions
4. Indexes and optimizations

## Rollback

To rollback a migration:
```sql
-- Example: Rollback rich content
ALTER TABLE clips
DROP COLUMN IF EXISTS content_type,
DROP COLUMN IF EXISTS file_data,
DROP COLUMN IF EXISTS file_size;
```

## Best Practices

- Always backup database before migrations
- Test migrations on staging first
- Review migration SQL before running
- Keep migrations small and focused
- Document breaking changes

