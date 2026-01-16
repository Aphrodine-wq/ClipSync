# GDPR Compliance Guide

ClipSync is designed with GDPR (General Data Protection Regulation) compliance in mind. This document outlines our GDPR implementation and user rights.

## GDPR Rights Implementation

### Right to Access (Article 15)

Users can export all their personal data at any time.

**Endpoint**: `GET /api/user/export`

**What's Included**:
- User profile information (email, name, picture)
- All clips (decrypted if encrypted)
- Folders and organization structure
- Tags
- Team memberships and roles
- Team clips shared by user
- Share links created
- Active sessions
- Audit logs (last 90 days)

**Format**: JSON file
**Processing Time**: <30 seconds for typical user
**No Size Limit**: Exports are streamed for large datasets

**Usage**:
```bash
curl -H "Authorization: Bearer <token>" \
  https://api.clipsync.com/api/user/export \
  -o clipsync-export.json
```

### Right to Rectification (Article 16)

Users can update their profile information at any time.

**Endpoints**:
- `PUT /api/auth/me` - Update profile
- `PUT /api/clips/:id` - Update clips
- `PUT /api/teams/:id` - Update teams

### Right to Erasure (Article 17) - "Right to be Forgotten"

Users can request deletion of all their personal data.

**Endpoint**: `DELETE /api/user/data`

**Process**:
1. **Soft Delete**: Account marked for deletion with 30-day retention
2. **Grace Period**: User can cancel within 30 days
3. **Hard Delete**: Permanent deletion after retention period
4. **Cascade**: All related data deleted
5. **Anonymization**: Audit logs anonymized (not deleted for compliance)

**Retention Period**: 30 days
**Cancellation**: `POST /api/user/data/cancel`

**What Gets Deleted**:
- User account
- All clips
- All folders
- All tags
- Team memberships (removed from teams)
- Share links created
- Active sessions
- Login attempts

**What Gets Anonymized**:
- Audit logs (user_id set to NULL, metadata anonymized)
- Activity logs (for compliance retention)

**Usage**:
```bash
curl -X DELETE \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"confirmation": "DELETE"}' \
  https://api.clipsync.com/api/user/data
```

### Right to Restriction of Processing (Article 18)

Users can pause clipboard monitoring (incognito mode) to restrict data collection.

**Implementation**:
- Incognito mode in settings
- Pauses automatic clipboard capture
- Manual clips still allowed
- No data collection when enabled

### Right to Data Portability (Article 20)

Data export provides machine-readable JSON format for easy import into other systems.

**Format**: JSON with standard structure
**Encoding**: UTF-8
**Structure**: Hierarchical with clear relationships

### Right to Object (Article 21)

Users can:
- Opt out of analytics
- Disable cloud sync (local-only mode)
- Disable team features
- Delete account at any time

## Data Minimization

We only collect data necessary for service operation:

**Collected**:
- Email (for authentication)
- Name (for display)
- Clips (user content)
- Device information (for sync)

**Not Collected**:
- Browsing history
- Location data (unless explicitly provided)
- Third-party tracking
- Analytics cookies (optional, user-controlled)

## Data Retention

**Active Users**: Data retained indefinitely (until deletion request)

**Deleted Users**: 
- Soft delete: 30 days retention
- Hard delete: Permanent deletion
- Audit logs: Anonymized, retained for compliance (7 years if required)

**Inactive Users**: 
- No automatic deletion
- User-initiated deletion only

## Security Measures

**Encryption**:
- All sensitive clips encrypted at rest (AES-256-GCM)
- All data encrypted in transit (TLS 1.3)
- Encryption keys never stored with data

**Access Controls**:
- Row-level security in database
- User can only access their own data
- Team access based on membership and role

**Audit Logging**:
- All data access logged
- PII masked in logs
- Export/deletion requests logged
- 90-day retention for user logs

## Data Processing Lawful Basis

**Consent**: User explicitly consents by creating account
**Contract**: Service provision requires data processing
**Legitimate Interest**: Security monitoring, fraud prevention

## Data Breach Notification

In the event of a data breach:
- Notification within 72 hours to supervisory authority
- Notification to affected users without undue delay
- Clear description of breach and mitigation steps

## Contact Information

For GDPR requests or questions:
- Email: privacy@clipsync.com
- Response Time: Within 30 days

## Compliance Status

- ✅ Right to Access - Implemented
- ✅ Right to Erasure - Implemented
- ✅ Right to Rectification - Implemented
- ✅ Right to Data Portability - Implemented
- ✅ Data Minimization - Implemented
- ✅ Security Measures - Implemented
- ✅ Audit Logging - Implemented
- ✅ PII Protection - Implemented

## Future Enhancements

- Automated data retention policies
- Enhanced export formats (CSV, XML)
- Bulk operations for data management
- Privacy dashboard for users

