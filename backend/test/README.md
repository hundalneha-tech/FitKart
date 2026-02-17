// test/README.md

# FitKart Backend Testing Suite

Comprehensive testing framework for validating all backend services, controllers, and endpoints.

## 📋 Test Structure

```
test/
├── controllers/          # Controller tests (HTTP layer)
│   ├── auth.controller.spec.ts
│   ├── user.controller.spec.ts
│   ├── coin.controller.spec.ts
│   ├── step.controller.spec.ts
│   ├── order.controller.spec.ts
│   ├── achievement.controller.spec.ts
│   ├── leaderboard.controller.spec.ts
│   ├── store.controller.spec.ts
│   └── admin.controller.spec.ts
├── services/            # Service tests (business logic)
│   ├── auth.service.spec.ts
│   ├── user.service.spec.ts
│   ├── coin.service.spec.ts
│   ├── step.service.spec.ts
│   ├── order.service.spec.ts
│   ├── achievement.service.spec.ts
│   ├── leaderboard.service.spec.ts
│   ├── store.service.spec.ts
│   └── admin.service.spec.ts
├── integration/         # Integration tests
│   ├── auth.integration.spec.ts
│   ├── order.flow.spec.ts
│   └── e2e.spec.ts
├── mocks/               # Mock utilities
│   ├── database.mock.ts
│   ├── redis.mock.ts
│   └── services.mock.ts
├── utils/               # Test utilities
│   ├── testHelpers.ts
│   └── testData.ts
├── setup.ts             # Global test setup
└── README.md            # This file
```

## 🚀 Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run specific test file
```bash
npm test -- auth.service.spec.ts
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="should register user"
```

### Run only failed tests
```bash
npm test -- --onlyChanged
```

## 📊 Test Coverage

Current coverage targets:
- **Statements:** 75%
- **Branches:** 70%
- **Functions:** 75%
- **Lines:** 75%

View coverage report:
```bash
npm test -- --coverage
# Then open coverage/index.html
```

## 🏗️ Test Categories

### Unit Tests - Services (Priority 1)
Testing individual service methods in isolation with mocked dependencies.

**Files:**
- `test/services/auth.service.spec.ts` - Authentication and token management
- `test/services/coin.service.spec.ts` - Wallet and coin operations
- `test/services/step.service.spec.ts` - Activity tracking and anti-cheat
- `test/services/order.service.spec.ts` - Order management and coin transactions
- `test/services/user.service.spec.ts` - User profile and management
- `test/services/achievement.service.spec.ts` - Badge system
- `test/services/leaderboard.service.spec.ts` - Rankings calculation
- `test/services/store.service.spec.ts` - Product catalog
- `test/services/admin.service.spec.ts` - Admin operations

**Focus:**
- ✅ Happy path (successful operation)
- ❌ Error cases (invalid inputs, not found, etc.)
- 🔐 Authentication/Authorization
- 💾 Data transformation and validation
- 📊 Complex business logic

### Integration Tests - Controllers (Priority 2)
Testing controllers with mocked services to validate HTTP layer.

**Files:**
- `test/controllers/auth.controller.spec.ts` - Request/response handling
- `test/controllers/user.controller.spec.ts` - User operations
- `test/controllers/coin.controller.spec.ts` - Coin operations
- (+ 6 more controller tests)

**Focus:**
- Request validation
- Response formatting
- Error handling and status codes
- Middleware integration
- Request/response transformation

### E2E Tests - Complete Flows (Priority 3)
Testing complete request flows through all layers.

**Files:**
- `test/integration/auth.integration.spec.ts` - Full auth flow
- `test/integration/order.flow.spec.ts` - Order creation to completion
- `test/integration/e2e.spec.ts` - Multi-step scenarios

**Focus:**
- Complete user journeys
- Cross-service interactions
- Data consistency
- Performance under load

## 🧪 Example: Writing a Service Test

```typescript
import { UserService } from '../../src/services/user.service';
import { UserRepository } from '../../src/repositories/user.repository';
import { createMockRepository, testDataFactories } from '../mocks/database.mock';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = createMockRepository();
    jest.spyOn(UserRepository.prototype, 'getRepository')
      .mockReturnValue(mockUserRepository);
    userService = new UserService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userId = '1';
      const mockUser = testDataFactories.createTestUser({ id: userId });
      
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await userService.getProfile(userId);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(result.id).toBe(userId);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw error for non-existent user', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(userService.getProfile('invalid'))
        .rejects.toThrow(NotFoundError);
    });
  });
});
```

## 🧪 Example: Writing a Controller Test

```typescript
import { UserController } from '../../src/controllers/user.controller';
import { createMockRequest, createMockResponse, verifyResponseFormat } from '../utils/testHelpers';

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: any;

  beforeEach(() => {
    mockUserService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
    };
    userController = new UserController();
    (userController as any).userService = mockUserService;
  });

  it('should get user profile', async () => {
    const user = testDataFactories.createTestUser();
    const req = createMockRequest({ user });
    const res = createMockResponse();

    mockUserService.getProfile.mockResolvedValue(user);

    await userController.getProfile(req, res);

    const response = verifyResponseFormat(res, 200);
    expect(response.data).toEqual(user);
  });
});
```

## 📚 Mock Utilities

### Database Mocks (`test/mocks/database.mock.ts`)

```typescript
import { createMockRepository, testDataFactories } from '../mocks/database.mock';

// Create mock repository
const mockRepo = createMockRepository();
mockRepo.find.mockResolvedValue([]);
mockRepo.findOneBy.mockResolvedValue(testData);

// Create test data
const testUser = testDataFactories.createTestUser({ email: 'custom@example.com' });
const testOrder = testDataFactories.createTestOrder({ status: 'confirmed' });
```

### Redis Mocks (`test/mocks/redis.mock.ts`)

```typescript
import { createMockRedisClient, createMockRateLimiter } from '../mocks/redis.mock';

// Mock Redis client
const redis = createMockRedisClient();
redis.set.mockResolvedValue('OK');
redis.get.mockResolvedValue('cachedValue');

// Mock rate limiter
const limiter = createMockRateLimiter();
limiter.checkLimit.mockResolvedValue({ allowed: true, remaining: 99 });
```

### Test Helpers (`test/utils/testHelpers.ts`)

```typescript
import {
  createMockRequest,
  createMockResponse,
  verifyResponseFormat,
  generateTestToken,
  testDataFactories,
} from '../utils/testHelpers';

// Create mock Express request/response
const req = createMockRequest({ body: { email: 'test@example.com' } });
const res = createMockResponse();

// Verify response format
const response = verifyResponseFormat(res, 200);
expect(response.data).toBeDefined();

// Generate test tokens
const token = generateTestToken({ id: '1', role: 'admin' });
```

## 🔍 Test Patterns

### Pattern 1: Happy Path Testing
```typescript
it('should successfully complete operation', async () => {
  // Setup mocks
  mockRepo.save.mockResolvedValue(expectedResult);
  
  // Execute
  const result = await service.operation(input);
  
  // Assert
  expect(result).toEqual(expectedResult);
  expect(mockRepo.save).toHaveBeenCalled();
});
```

### Pattern 2: Error Handling Testing
```typescript
it('should throw error on invalid input', async () => {
  mockRepo.findOneBy.mockResolvedValue(null);
  
  await expect(service.operation(invalidInput))
    .rejects.toThrow(NotFoundError);
});
```

### Pattern 3: Authorization Testing
```typescript
it('should verify user authorization', async () => {
  const req = createMockRequest({ user: { id: '1', role: 'user' } });
  
  const result = await controller.sensitiveOperation(req, res);
  
  expect(result).toBeDefined();
});
```

### Pattern 4: Data Transformation Testing
```typescript
it('should transform and format data correctly', async () => {
  const mockData = { id: '1', email: 'test@example.com' };
  mockRepo.find.mockResolvedValue([mockData]);
  
  const result = await service.getFormatted();
  
  expect(result).toHaveProperty('formatted');
  expect(result).toHaveProperty('transformed');
});
```

## 📈 Coverage Goals

### Current Implementation (Sample Tests)
- ✅ AuthService - 8 test suites, ~40 test cases
- ✅ CoinService - 6 test suites, ~25 test cases
- ✅ AuthController - 7 test suites, ~20 test cases

### Next Phase Implementation
- UserService, StepService, OrderService tests
- AchievementService, LeaderboardService tests
- StoreService, AdminService tests
- User, Coin, Step, Order controllers
- Achievement, Leaderboard, Store, Admin controllers

### E2E Test Implementation
- Authentication flow (register → login → token refresh)
- Order flow (create → freeze coins → confirm → complete)
- Leaderboard updates after step recording
- Multi-user concurrent operations

## 🚨 Debugging Tests

### View detailed output
```bash
npm test -- --verbose
```

### Debug specific test
```bash
NODE_DEBUG_OPTION='--inspect-brk' npm test -- auth.service.spec.ts --runInBand
```

### Update snapshots
```bash
npm test -- --updateSnapshot
```

### Run only failed tests
```bash
npm test -- --onlyFailed
```

## 📝 Test Template

Copy this template when creating new test files:

```typescript
// test/services/[feature].service.spec.ts

import { [Feature]Service } from '../../src/services/[feature].service';
import { [Feature]Repository } from '../../src/repositories/[feature].repository';
import { createMockRepository, testDataFactories } from '../mocks/database.mock';

describe('[Feature]Service', () => {
  let service: [Feature]Service;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = createMockRepository();
    jest.spyOn([Feature]Repository.prototype, 'getRepository')
      .mockReturnValue(mockRepository);
    service = new [Feature]Service();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('method', () => {
    it('should perform operation', async () => {
      // Arrange
      const input = {};
      
      // Act
      const result = await service.method(input);
      
      // Assert
      expect(result).toBeDefined();
    });
  });
});
```

## 🔗 Related Documentation

- [Jest Documentation](https://jestjs.io/)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [TypeORM Testing Guide](https://typeorm.io/separating-entity-definition)
- [Express Testing Best Practices](https://expressjs.com/en/guide/testing.html)

## ✅ Checklist for New Tests

- [ ] All mocks are created and properly configured
- [ ] Test data factories are used for consistency
- [ ] Non-dependent tests run in parallel
- [ ] Error cases are tested
- [ ] Authorization/authentication is verified
- [ ] Request/response formats are validated
- [ ] Database calls are mocked
- [ ] External API calls are mocked
- [ ] Coverage threshold is met (70%+)
- [ ] Tests are deterministic (no flakiness)
- [ ] Tests cleanup properly (clearAllMocks)
- [ ] Meaningful assertion messages are used

