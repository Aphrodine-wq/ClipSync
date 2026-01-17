# Testing Documentation

## Test Structure

```
backend/__tests__/
  unit/          # Unit tests
  integration/   # Integration tests
clipsync-app/src/__tests__/
  components/    # Component tests
  utils/         # Utility tests
e2e/             # End-to-end tests
```

## Running Tests

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### All Tests
```bash
npm test
```

### Coverage
```bash
npm run test:coverage
```

## Test Commands

Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage"
  }
}
```

