// test/TESTING_GUIDE.md

# FitKart Backend Testing Guide

## 🎯 Testing Strategy

The FitKart backend testing strategy follows a **pyramid approach**:

```
        /\
       /  \       E2E Tests (5%)
      /----\     - Complete user journeys
     /      \    - Database integration
    /--------\   - All services together
   /          \
  /            \ Integration Tests (25%)
 /              \- Service + Repository
/                \- Controller + Service
/ ---- E2E ----\ - Cross-service interactions
/    INTEGRATION \
/ - UNIT TESTS -- \
|                  |
| UNIT TESTS (70%) |
| - Services       |  (Base: Maximum test coverage)
| - Utilities      |  
| - Validators     |
| - Repositories   |
```

## 📊 Test Coverage Targets

| Layer | Coverage | Priority | Focus |
|-------|----------|----------|-------|
| Services | 80%+ | 1️⃣ HIGH | Business logic |
| Controllers | 75%+ | 2️⃣ MEDIUM | HTTP handling |
| Repositories | 70%+ | 3️⃣ MEDIUM | Data access |
| Utilities | 85%+ | 2️⃣ MEDIUM | Helpers |
| Integration | 60%+ | 3️⃣ MEDIUM | Workflows |

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Test Database
```bash
# Create test database
createdb fitkart_test

# This is only needed once
```

### 3. Run Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage

# Specific file
npm test -- auth.service
```

## 📝 Test Examples by Service

### AuthService Tests ✅
Located: `test/services/auth.service.spec.ts`

**Coverage:**
- ✅ User registration with validation
- ✅ Login with credentials
- ✅ OTP generation and verification
- ✅ Token refresh mechanism
- ✅ Email verification
- ✅ Error cases (duplicate email, wrong password, expired OTP)

**Run:**
```bash
npm test -- auth.service.spec.ts
```

### CoinService Tests ✅
Located: `test/services/coin.service.spec.ts`

**Coverage:**
- ✅ Coin balance calculation
- ✅ Transaction history with pagination
- ✅ Balance validation before spending
- ✅ Coin freezing for orders
- ✅ Coin unfreezing on refund
- ✅ Admin coin addition
- ✅ Statistics calculation

**Run:**
```bash
npm test -- coin.service.spec.ts
```

### AuthController Tests ✅
Located: `test/controllers/auth.controller.spec.ts`

**Coverage:**
- ✅ HTTP request/response handling
- ✅ Input validation integration
- ✅ Error response formatting
- ✅ Status code verification
- ✅ Token in response

**Run:**
```bash
npm test -- auth.controller.spec.ts
```

## 🔧 Creating New Tests

### Template: Service Test
```typescript
import { MyService } from '../../src/services/my.service';
import { MyRepository } from '../../src/repositories/my.repository';
import { createMockRepository, testDataFactories } from '../mocks/database.mock';

describe('MyService', () => {
  let service: MyService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = createMockRepository();
    jest.spyOn(MyRepository.prototype, 'getRepository')
      .mockReturnValue(mockRepository);
    service = new MyService();
  });

  describe('method', () => {
    it('should perform desired action', async () => {
      // Arrange
      const input = {};
      mockRepository.find.mockResolvedValue([]);
      
      // Act
      const result = await service.method(input);
      
      // Assert
      expect(result).toBeDefined();
    });

    it('should handle error case', async () => {
      // Arrange
      mockRepository.findOneBy.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.method({}))
        .rejects.toThrow(NotFoundError);
    });
  });
});
```

### Template: Controller Test
```typescript
import { MyController } from '../../src/controllers/my.controller';
import { createMockRequest, createMockResponse, verifyResponseFormat } from '../utils/testHelpers';

describe('MyController', () => {
  let controller: MyController;
  let mockService: any;

  beforeEach(() => {
    mockService = { method: jest.fn() };
    controller = new MyController();
    (controller as any).myService = mockService;
  });

  it('should handle request successfully', async () => {
    const req = createMockRequest({ body: { data: 'test' } });
    const res = createMockResponse();

    mockService.method.mockResolvedValue({ result: 'success' });

    await controller.method(req, res);

    const response = verifyResponseFormat(res, 200);
    expect(response.data).toEqual({ result: 'success' });
  });
});
```

## 📋 Test Checklist

When implementing a new service or controller, ensure:

### For Services:
- [ ] All public methods have tests
- [ ] Both success and error cases are covered
- [ ] Input validation is tested
- [ ] Authorization checks are verified
- [ ] Database interactions are mocked
- [ ] Error messages are meaningful
- [ ] Coverage > 75%

### For Controllers:
- [ ] All HTTP methods are tested
- [ ] Request validation is verified
- [ ] Response format is correct
- [ ] Status codes are accurate
- [ ] Error handling is tested
- [ ] Authentication middleware integration
- [ ] Coverage > 70%

### For Integration Tests:
- [ ] Multi-step workflows are covered
- [ ] Service interactions are validated
- [ ] Data consistency is checked
- [ ] Error scenarios are tested

## 🐛 Debugging Tests

### Run single test
```bash
npm test -- --testNamePattern="should register user"
```

### Debug with breakpoint
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
# Then open chrome://inspect in Chrome
```

### Show verbose output
```bash
npm test -- --verbose
```

### Update snapshots
```bash
npm test -- -u
```

## 📊 Coverage Report

### Generate coverage
```bash
npm test -- --coverage
```

### View HTML coverage
```bash
# After running coverage
open coverage/lcov-report/index.html
```

### Coverage by file
```bash
npm test -- --coverage --collectCoverageFrom='src/**/*.ts'
```

## 🏃 Running in CI/CD

### GitHub Actions Example
```yaml
- name: Run Tests
  run: npm test -- --coverage --watchAll=false

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## ✨ Best Practices

### 1. **Use Test Data Factories**
```typescript
// ✅ Good
const user = testDataFactories.createTestUser({ email: 'test@example.com' });

// ❌ Avoid
const user = { id: '1', email: 'test@example.com' /* incomplete */ };
```

### 2. **Mock External Dependencies**
```typescript
// ✅ Good - Redis is mocked
const redis = createMockRedisClient();
redis.get.mockResolvedValue('cached_value');

// ❌ Avoid - Would require real Redis
const redis = new Redis();
```

### 3. **Clear and Descriptive Test Names**
```typescript
// ✅ Good
it('should freeze coins for order when user has sufficient balance')

// ❌ Avoid
it('freezes coins')
```

### 4. **Test One Thing Per Test**
```typescript
// ✅ Good - Tests single concern
it('should validate email format before sending OTP', async () => {
  await expect(service.sendOTP('invalid-email'))
    .rejects.toThrow(ValidationError);
});

// ❌ Avoid - Tests multiple concerns
it('should send OTP and validate email and format response', async () => {
  // Multiple assertions
});
```

### 5. **Use Arrange-Act-Assert Pattern**
```typescript
it('should create order and deduct coins', async () => {
  // Arrange
  const mockUser = testDataFactories.createTestUser();
  mockUserRepository.findOneBy.mockResolvedValue(mockUser);
  
  // Act
  const result = await service.createOrder(mockUser.id, orderData);
  
  // Assert
  expect(result).toHaveProperty('id');
  expect(mockCoinService.spend).toHaveBeenCalled();
});
```

## 🔄 Continuous Testing

### Watch mode for development
```bash
npm run test:watch
```

### Test before commit
```bash
# Add to .git/hooks/pre-commit
npm test -- --bail
```

### Run full suite before push
```bash
npm test -- --coverage --detectOpenHandles
```

## 📚 Test File Structure

```
test/
├── services/
│   ├── auth.service.spec.ts          ✅ Complete
│   ├── coin.service.spec.ts          ✅ Complete
│   ├── user.service.spec.ts          📝 In Progress
│   ├── step.service.spec.ts          📝 In Progress
│   ├── order.service.spec.ts         📝 In Progress
│   └── ...
├── controllers/
│   ├── auth.controller.spec.ts       ✅ Complete
│   ├── user.controller.spec.ts       📝 In Progress
│   └── ...
├── integration/
│   ├── auth.integration.spec.ts      ✅ Complete
│   ├── order.flow.spec.ts            📝 In Progress
│   └── e2e.spec.ts                   📝 In Progress
├── mocks/
│   ├── database.mock.ts              ✅ Complete
│   ├── redis.mock.ts                 ✅ Complete
│   └── services.mock.ts              ✅ Complete
└── utils/
    ├── testHelpers.ts                ✅ Complete
    └── testData.ts                   📝 In Progress
```

## 🎓 Learning Resources

- [Jest Documentation](https://jestjs.io/)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Service Testing Patterns](https://github.com/goldbergyoni/nodejs-testing-best-practices)

## 📞 Support

For testing questions or issues:
1. Check existing test files for patterns
2. Review the TESTING_GUIDE.md
3. Reference test templates in README.md
4. Ask in team chat or create an issue

