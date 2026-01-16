# Encryption Implementation Details

ClipSync uses industry-standard encryption to protect sensitive user data.

## Encryption Algorithms

### At Rest Encryption

**Algorithm**: AES-256-GCM (Advanced Encryption Standard, 256-bit key, Galois/Counter Mode)

**Why AES-256-GCM**:
- Industry standard, widely trusted
- Authenticated encryption (prevents tampering)
- High performance
- Hardware acceleration support
- 256-bit key provides strong security

**Key Specifications**:
- Key Length: 32 bytes (256 bits)
- IV Length: 16 bytes (128 bits)
- Auth Tag Length: 16 bytes (128 bits)
- Block Size: 128 bits

### In Transit Encryption

**Protocol**: TLS 1.3

**Why TLS 1.3**:
- Latest TLS version
- Improved security over TLS 1.2
- Faster handshake
- Forward secrecy
- Strong cipher suites

## Key Management

### Encryption Key

**Storage**: Environment variable `ENCRYPTION_KEY`

**Format**: 64-character hexadecimal string (32 bytes)

**Generation**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Production Enforcement**:
- Application fails to start if `ENCRYPTION_KEY` not set in production
- No default keys in production
- Key format validation

**Key Rotation**:
- Supported via migration script
- Batch processing for large datasets
- Zero-downtime rotation possible
- Audit logging of rotation process

### Master Encryption Key

**Purpose**: Encrypts configuration secrets

**Storage**: Environment variable `MASTER_ENCRYPTION_KEY`

**Format**: 64-character hexadecimal string (32 bytes)

**Usage**: Encrypts sensitive configuration values

## Encryption Format

### Encrypted Data Structure

```
{iv}:{authTag}:{encryptedData}
```

All components are hex-encoded:
- `iv`: 32 hex characters (16 bytes)
- `authTag`: 32 hex characters (16 bytes)
- `encryptedData`: Variable length hex string

**Example**:
```
a1b2c3d4e5f6...:f1e2d3c4b5a6...:9f8e7d6c5b4a3...
```

### Encryption Process

1. **Generate IV**: Random 16 bytes
2. **Create Cipher**: `crypto.createCipheriv('aes-256-gcm', key, iv)`
3. **Encrypt Data**: Convert to hex
4. **Get Auth Tag**: `cipher.getAuthTag()`
5. **Combine**: `{iv}:{authTag}:{encryptedData}`

### Decryption Process

1. **Split**: Split by `:` into 3 parts
2. **Parse**: Convert hex to buffers
3. **Create Decipher**: `crypto.createDecipheriv('aes-256-gcm', key, iv)`
4. **Set Auth Tag**: `decipher.setAuthTag(authTag)`
5. **Decrypt**: Convert from hex to UTF-8
6. **Verify**: Auth tag verification (automatic)

## Sensitive Data Detection

### Detection Patterns

**API Keys**:
- Pattern: `api[_-]?key\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{20,})`
- Confidence: High

**Passwords**:
- Pattern: `password\s*[:=]\s*['"]?([^\s'"]{8,})`
- Confidence: High

**Tokens**:
- Pattern: `token\s*[:=]\s*['"]?([a-zA-Z0-9_\-\.]{20,})`
- Confidence: Medium

**AWS Credentials**:
- Pattern: `aws[_-]?access[_-]?key[_-]?id\s*[:=]\s*['"]?([A-Z0-9]{20})`
- Confidence: High

**Database URLs**:
- Pattern: `(mongodb|postgres|mysql|redis):\/\/[^\s'"]+`
- Confidence: High

### Encryption Trigger

**Automatic Encryption**:
- High confidence detection (>0.7)
- User explicitly requests encryption
- Contains multiple sensitive patterns

**Manual Encryption**:
- User can mark clip as sensitive
- Settings option for "encrypt all clips"

## Key Rotation

### Rotation Process

1. **Generate New Key**: 64-character hex string
2. **Set Environment**: Update `ENCRYPTION_KEY`
3. **Run Migration**: `migrateToNewKey(oldKey, newKey)`
4. **Restart Application**: New key takes effect
5. **Monitor**: Check logs for errors

### Migration Script

```javascript
import { migrateToNewKey } from './utils/keyRotation.js';

const oldKey = process.env.ENCRYPTION_KEY;
const newKey = generateNewEncryptionKey();

await migrateToNewKey(oldKey, newKey);
```

**Process**:
- Batch processing (100 clips per batch)
- Decrypt with old key
- Re-encrypt with new key
- Update database
- Error handling and retry
- Progress logging

**Safety**:
- Keep old key available during migration
- Rollback possible if errors occur
- Audit logging of all operations

## Security Best Practices

### Key Storage

✅ **Do**:
- Store keys in environment variables
- Use secure key management services (AWS Secrets Manager, HashiCorp Vault)
- Rotate keys regularly (quarterly recommended)
- Use different keys for different environments

❌ **Don't**:
- Commit keys to version control
- Share keys via insecure channels
- Use default keys in production
- Store keys in code

### Key Generation

✅ **Do**:
- Use cryptographically secure random number generator
- Generate 32-byte (256-bit) keys
- Use hex encoding for storage
- Verify key format before use

❌ **Don't**:
- Use predictable patterns
- Reuse keys across environments
- Use short keys
- Derive keys from passwords

### Encryption Usage

✅ **Do**:
- Encrypt sensitive data automatically
- Use authenticated encryption (GCM mode)
- Generate new IV for each encryption
- Verify auth tags on decryption

❌ **Don't**:
- Reuse IVs
- Skip auth tag verification
- Store IVs with keys
- Use ECB mode

## Compliance

**Standards Compliance**:
- FIPS 140-2 (algorithm)
- NIST SP 800-38D (GCM mode)
- OWASP recommendations

**Certifications** (Planned):
- SOC 2 Type II
- ISO 27001

## Performance

**Encryption Speed**: ~10MB/s per core
**Decryption Speed**: ~10MB/s per core
**Overhead**: ~10% for encrypted clips
**Impact**: Minimal on user experience

## Future Enhancements

- Hardware Security Module (HSM) integration
- Key escrow for recovery
- Per-user encryption keys
- End-to-end encryption for team clips
- Client-side encryption option

