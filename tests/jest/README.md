# Test Organization Guide

## Directory Structure

```
__tests__/                    # Jest unit and integration tests
├── unit/                     # Unit tests
│   ├── components/           # React component tests
│   ├── lib/                  # Library/utility tests
│   │   ├── actions/          # Server action tests
│   │   ├── data/             # Data layer tests  
│   │   └── utils/            # Utility function tests
│   └── pages/                # Page component tests
├── integration/              # Integration tests
├── fixtures/                 # Test data and mocks
└── tsconfig.json            # TypeScript config for tests

tests/                       # Other test frameworks
├── robot/                   # Robot Framework tests
└── server-actions/          # Legacy server action tests

cypress/                     # End-to-end tests
├── e2e/                     # E2E test specs
├── fixtures/                # E2E test data
└── support/                 # Cypress support files
```

## File Naming Conventions

### Unit Tests
- `*.test.ts` - Pure logic/function tests
- `*.test.tsx` - React component tests
- `*.spec.ts` - Specification-based tests

### Test Files Should Mirror Source Structure
```
lib/actions/patients.ts       → __tests__/unit/lib/actions/patients.test.ts
lib/data/patients.ts          → __tests__/unit/lib/data/patients.test.ts  
components/Sidebar.tsx        → __tests__/unit/components/Sidebar.test.tsx
app/patients/page.tsx         → __tests__/unit/pages/patients.test.tsx
```

## Import Aliases

Use `@/` alias for cleaner imports:
```typescript
import { getPatients } from '@/lib/data/patients';

import { getPatients } from '../../../../lib/data/patients';
```

## Test Categories

### Unit Tests (`__tests__/unit/`)
- Test individual functions/components in isolation
- Mock external dependencies
- Fast execution

### Integration Tests (`__tests__/integration/`)
- Test multiple components working together
- Test API endpoints with real/test database
- Test complex workflows

### E2E Tests (`cypress/e2e/`)
- Test complete user workflows
- Test in real browser environment
- Test critical business paths