# 🤝 Contributing to FitKart

Thank you for considering contributing to FitKart! We welcome developers, designers, and enthusiasts to help improve the platform.

**Version**: 1.0  
**Last Updated**: February 17, 2026

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Commit Messages](#commit-messages)
- [Documentation](#documentation)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

### Our Commitment

We are committed to providing a welcoming and inclusive environment for all contributors. 

### Expected Behavior

- Use respectful and inclusive language
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling or insulting comments
- Deliberate intimidation
- Publishing private information
- Any other conduct considered inappropriate

### Reporting Violations

Please report code of conduct violations to [conduct@fitkart.com](mailto:conduct@fitkart.com) with details.

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Development Environment Setup**
   ```bash
   # Follow the setup guide
   # See: SETUP_GUIDE.md
   ```

2. **GitHub Account**
   - Create at [github.com](https://github.com)
   - Setup SSH keys

3. **Git Knowledge**
   - Basic Git commands (clone, branch, commit, push)
   - Recommended: Git workflow tutorial

### Fork & Clone

```bash
# 1. Fork the repository on GitHub
# Navigate to: https://github.com/yourusername/FitKart
# Click "Fork" button

# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/FitKart.git
cd FitKart

# 3. Add upstream remote
git remote add upstream https://github.com/original-owner/FitKart.git

# 4. Verify remotes
git remote -v
# Should show:
# origin    https://github.com/YOUR-USERNAME/FitKart.git (fetch)
# upstream  https://github.com/original-owner/FitKart.git (fetch)
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
# Update from main repository
git fetch upstream
git checkout upstream/main

# Create feature branch from main
git checkout -b feature/your-feature-name

# Branch naming convention:
# feature/short-description   - New features
# bugfix/short-description    - Bug fixes
# docs/short-description      - Documentation
# refactor/short-description  - Code refactoring
# perf/short-description      - Performance improvements
# chore/short-description     - Build, CI/CD changes
```

### 2. Make Changes

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Make your changes in the editor

# Run tests on modified files
npm test -- path/to/changed/file.spec.ts

# Check code quality
npm run lint

# Fix linting issues
npm run lint:fix
```

### 3. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new authentication method"

# Or interactive staging
git add --patch    # Choose specific changes
```

### 4. Keep Fork Updated

```bash
# Fetch latest from upstream
git fetch upstream

# Rebase on latest main (preferred over merge)
git rebase upstream/main

# If conflicts occur, resolve them:
# 1. Fix conflicting files
# 2. Stage fixed files: git add <file>
# 3. Continue rebase: git rebase --continue

# Force push to your fork (ONLY on your branch)
git push origin feature/your-feature-name --force
```

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# 1. Visit: https://github.com/YOUR-USERNAME/FitKart
# 2. Click "New Pull Request"
# 3. Compare your branch against upstream/main
# 4. Fill in PR template (see below)
# 5. Click "Create Pull Request"
```

---

## Code Standards

### TypeScript Style

Follow these conventions for consistent code:

#### Basic Rules

```typescript
// ✅ Good: Use const by default
const MAX_RETRIES = 3;
const getUserById = async (id: string) => {...};

// ❌ Avoid: var is obsolete
var userId = "123";

// ✅ Good: Explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ Avoid: Implicit any
function getUser(id: any) {...}
```

#### Naming Conventions

```typescript
// Constants (UPPER_SNAKE_CASE)
const DEFAULT_PAGE_SIZE = 20;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Classes (PascalCase)
class UserService {
  public async getUser(id: string): Promise<User> { }
}

// Functions (camelCase)
const calculateTotalCoins = (steps: number): number => {
  return steps / 100;
};

// Private members (_camelCase)
private _cache: Map<string, unknown>;
```

#### Function Documentation

```typescript
/**
 * Calculate coins earned based on steps recorded.
 * 
 * @param {number} steps - Total steps recorded
 * @param {CoinMultiplier} multiplier - Multiplier (normal, weekend, event)
 * @returns {number} Coins earned
 * 
 * @example
 * const coins = calculateCoins(5000, 'normal');
 * // Returns: 50
 * 
 * @throws {InvalidStepsError} If steps < 0
 */
export const calculateCoins = (
  steps: number, 
  multiplier: CoinMultiplier = 'normal'
): number => {
  if (steps < 0) {
    throw new InvalidStepsError('Steps cannot be negative');
  }
  return (steps / 100) * getMultiplier(multiplier);
};
```

#### Error Handling

```typescript
// ✅ Custom error classes
class DatabaseError extends Error {
  constructor(message: string, public code: string = 'DB_ERROR') {
    super(message);
    this.name = 'DatabaseError';
  }
}

// ✅ Proper error handling
try {
  const user = await userRepository.findOne(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
} catch (error) {
  if (error instanceof NotFoundError) {
    throw error; // Re-throw known errors
  }
  logger.error('Unexpected error:', error);
  throw new DatabaseError('Failed to fetch user');
}
```

### File Organization

```
src/
├── entities/          # Database models
│   ├── User.ts
│   ├── Coin.ts
│   └── index.ts
├── services/          # Business logic
│   ├── AuthService.ts
│   ├── CoinService.ts
│   └── index.ts
├── controllers/       # HTTP handlers
│   ├── AuthController.ts
│   └── index.ts
├── routes/           # API endpoints
│   ├── auth.ts
│   └── index.ts
├── middleware/       # Custom middleware
├── utils/            # Helper functions
├── config/           # Configuration
└── app.ts            # Express app
```

---

## Testing Requirements

### Test Coverage Targets

- **Services**: 80%+ coverage
- **Controllers**: 75%+ coverage
- **Integration**: 70%+ coverage
- **Overall**: 75%+ minimum

### Writing Tests

```typescript
// ✅ Good test structure
describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  
  beforeEach(() => {
    userRepository = createMockRepository();
    authService = new AuthService(userRepository);
  });
  
  describe('register', () => {
    it('should create user with valid input', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };
      
      // Act
      const result = await authService.register(input);
      
      // Assert
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(input.email);
      expect(userRepository.save).toHaveBeenCalled();
    });
  });
});
```

### Running Tests

```bash
# All tests
npm test

# Specific test file
npm test -- auth.service.spec.ts

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Pull Request Process

### PR Template

```markdown
## Description
Brief description of changes

## Type
- [ ] Feature
- [ ] Bug Fix
- [ ] Documentation
- [ ] Refactoring

## Related Issue
Closes #123

## Changes
- Change 1
- Change 2

## Checklist
- [ ] Tests added/updated
- [ ] Linting passes
- [ ] Documentation updated
```

### Review Process

1. **Automated Checks**
   - Linting passes
   - Tests pass (75%+ coverage)
   - Build succeeds

2. **Code Review** (2 approvers minimum)
   - Code quality
   - Test coverage
   - Documentation
   - Security implications

---

## Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

```
feat:     A new feature
fix:      A bug fix
docs:     Documentation only
refactor: Code refactoring
perf:     Performance improvements
test:     Adding or updating tests
chore:    Build process, dependencies
```

### Examples

```bash
# Feature
git commit -m "feat(auth): add OTP-based login"

# Bug fix
git commit -m "fix(coins): prevent negative balance"

# Documentation
git commit -m "docs: add API rate limiting documentation"
```

---

## Documentation

### Update Documentation for Changes

```bash
# API changes
# → Update: API_DOCUMENTATION.md

# Deployment changes
# → Update: DEPLOYMENT_GUIDE.md

# Development changes
# → Update: SETUP_GUIDE.md, backend/README.md
```

### Code Comments

```typescript
// ✅ Good: Explain why, not what
// Use Redis cache to reduce database load
const cacheKey = `leaderboard:${period}`;

// ❌ Bad: State the obvious
// Set cache key
const cacheKey = `leaderboard:${period}`;
```

---

## Reporting Bugs

### Bug Report Template

```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: macOS / Linux / Windows
- Node.js: 18.x
```

---

## Suggesting Features

### Feature Request Template

```markdown
## Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should it work?

## Alternatives
Other solutions considered?
```

---

## Questions?

- **Documentation**: [README.md](./README.md)
- **Setup Help**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/FitKart/issues)

---

**Thank you for contributing to FitKart!** 🎉

---

**Last Updated**: February 17, 2026  
**Version**: 1.0
