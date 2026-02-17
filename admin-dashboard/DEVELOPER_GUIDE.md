# Admin Dashboard Developer Guide

**For developers transitioning from backend to frontend development**

---

## 📋 Table of Contents

- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Key Technologies](#key-technologies)
- [Working with Components](#working-with-components)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Testing Strategy](#testing-strategy)
- [Best Practices](#best-practices)

---

## 🔄 Development Workflow

### Starting Your Day

```bash
# 1. Navigate to project
cd admin-dashboard

# 2. Ensure environment is set
cat .env.local | head -5

# 3. Start backend
# Terminal 1: backend running on port 3000

# 4. Start frontend dev server
npm run dev
# Terminal 2: admin dashboard on port 3001

# 5. Open browser
open http://localhost:3001
```

### Feature Development Process

```
1. Create task/issue with requirements
2. Create feature branch: git checkout -b feature/my-feature
3. Create components in src/
4. Test in browser while npm run dev
5. Run linter: npm run lint:fix
6. Run tests: npm run test
7. Commit: git commit -m "feat: add my feature"
8. Push: git push origin feature/my-feature
9. Create Pull Request
10. Deploy after review
```

### Code Review Checklist

- ✅ TypeScript strict mode passes
- ✅ No ESLint errors
- ✅ Prettier formatting applied
- ✅ Tests written and passing
- ✅ Component has prop documentation
- ✅ API calls use hooks properly
- ✅ Error states handled
- ✅ Loading states shown
- ✅ Responsive design tested
- ✅ Performance acceptable

---

## 📁 Project Structure Breakdown

### Configuration Root
```
admin-dashboard/
├── .env.local              # Your local environment
├── .env.example            # Template (commit this)
├── package.json            # Dependencies (update carefully)
├── tsconfig.json           # TypeScript (don't modify)
├── next.config.js          # Next.js (rarely changes)
├── tailwind.config.js      # Tailwind theme (customize here)
├── postcss.config.js       # CSS processing (don't modify)
├── jest.config.js          # Testing (rarely changes)
└── .eslintrc.json          # Linting (style guide)
```

### Source Code (src/)
```
src/
├── pages/                  # Routes (auto-routed by Next.js)
│   ├── login.tsx          # /login
│   ├── dashboard.tsx      # /dashboard
│   ├── users.tsx          # /users
│   ├── products.tsx       # /products
│   ├── orders.tsx         # /orders
│   ├── leaderboard.tsx    # /leaderboard
│   ├── suspicious.tsx     # /suspicious
│   └── settings.tsx       # /settings
│
├── components/            # Reusable UI components
│   ├── Layout.tsx         # Main layout wrapper
│   ├── Header.tsx         # Top navigation
│   ├── Sidebar.tsx        # Side navigation
│   ├── Card.tsx           # Reusable card
│   ├── Table.tsx          # Table component
│   ├── Modal.tsx          # Modal dialog
│   └── Loading.tsx        # Loading spinner
│
├── hooks/                 # Custom React hooks
│   ├── useApi.ts          # React Query hooks (40+ hooks)
│   ├── useAuth.ts         # Zustand auth store
│   ├── useLocalStorage.ts # Local storage hook
│   └── usePagination.ts   # Pagination logic
│
├── lib/                   # Utility functions
│   ├── api.ts            # Axios API client
│   ├── utils.ts          # Helper functions
│   ├── constants.ts      # App constants
│   └── validators.ts     # Form validators
│
├── types/                 # TypeScript types
│   └── index.ts          # Global type definitions
│
└── styles/                # Global styles
    └── globals.css        # Tailwind imports
```

### Testing & Documentation
```
tests/                      # Jest test files
├── api.test.ts
├── hooks.test.ts
└── components.test.tsx

docs/                       # Additional docs
├── SETUP_GUIDE.md
├── QUICK_REFERENCE.md
└── README.md
```

---

## 🛠️ Key Technologies Explained

### Next.js 14

**What it does**: React framework with routing, SSR, optimization

**Key concepts**:
```typescript
// 1. File-based routing (automatically)
src/pages/users.tsx         // → /users
src/pages/users/[id].tsx    // → /users/:id
src/pages/admin/settings.tsx // → /admin/settings

// 2. API routes (not used here, backend separate)
src/pages/api/route.ts      // API endpoint (we use backend instead)

// 3. Static generation & SSR
export async function getServerSideProps() {
  const data = await fetch(API_URL);
  return { props: { data } };
}

// 4. Image optimization
import Image from 'next/image';
<Image src="/logo.png" width={100} height={100} alt="Logo" />
```

### TypeScript

**What it does**: Adds type safety to JavaScript

```typescript
// 1. Interface (structure definition)
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// 2. Function typing
function greetUser(user: User): string {
  return `Hello, ${user.name}`;
}

// 3. Generic types
function getItem<T>(id: string): Promise<T> {
  return fetch(`/api/items/${id}`).then(r => r.json());
}

// 4. Union types
type Status = 'active' | 'inactive' | 'blocked';

// 5. Strict mode benefits
// - Must type all function params
// - Must handle all cases
// - Can't use undefined without explicit Optional<T>
```

### Tailwind CSS

**What it does**: Utility-first CSS framework

```html
<!-- Before: Write CSS classes -->
<div class="container bg-white p-4 rounded-lg shadow-lg">
  <h1 class="text-2xl font-bold text-gray-900">Hello</h1>
</div>

<!-- After: Use Tailwind utilities -->
<div className="bg-gray-900 p-6 rounded-lg">
  <h1 className="text-2xl font-bold text-white">Hello</h1>
</div>
```

### React Query (TanStack Query)

**What it does**: Automatic server state management

```typescript
// Without React Query (manual state management)
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetch('/api/users')
    .then(r => r.json())
    .then(data => setUsers(data))
    .catch(e => setError(e))
    .finally(() => setLoading(false));
}, []);

// With React Query (automatic!)
const { data: users, isLoading, error } = useUsers();
// Automatically handles: caching, refetching, deduplication, etc.
```

### Zustand

**What it does**: Simple state management for client state

```typescript
// Define store
import create from 'zustand';

const useUserStore = create(set => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

// Use in component
const { user, setUser, clearUser } = useUserStore();
```

---

## 🎨 Working with Components

### Component Types

#### 1. Presentational Components (UI only)
```typescript
// src/components/Button.tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export default function Button({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded font-semibold transition';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-700 text-white hover:bg-gray-800',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} disabled:opacity-50`}
    >
      {loading ? 'Loading...' : label}
    </button>
  );
}

// Usage
<Button 
  label="Delete" 
  variant="danger"
  onClick={() => deleteUser()}
/>
```

#### 2. Container Components (with logic)
```typescript
// src/pages/users.tsx
import Layout from '@/components/Layout';
import { useUsers, useBlockUser } from '@/hooks/useApi';

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const { mutate: blockUser } = useBlockUser();

  if (isLoading) return <Layout><p>Loading...</p></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold">Users</h1>
      <UserTable users={users} onBlock={blockUser} />
    </Layout>
  );
}
```

#### 3. Hook Components (just logic)
```typescript
// src/hooks/usePagination.ts
export function usePagination<T>(items: T[], itemsPerPage: number = 20) {
  const [page, setPage] = useState(1);
  
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const current = items.slice(start, end);

  return {
    current,
    page,
    totalPages,
    next: () => setPage(p => Math.min(p + 1, totalPages)),
    prev: () => setPage(p => Math.max(p - 1, 1)),
    goToPage: (p: number) => setPage(Math.min(Math.max(p, 1), totalPages)),
  };
}
```

### Creating a New Component

**Step 1: Define props interface**
```typescript
interface MyComponentProps {
  title: string;
  items: string[];
  onSelect?: (item: string) => void;
}
```

**Step 2: Create component**
```typescript
export default function MyComponent({
  title,
  items,
  onSelect,
}: MyComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
      {items.map(item => (
        <button key={item} onClick={() => onSelect?.(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}
```

**Step 3: Use in page**
```typescript
import MyComponent from '@/components/MyComponent';

export default function Page() {
  return (
    <Layout>
      <MyComponent
        title="Select an option"
        items={['Option 1', 'Option 2']}
        onSelect={console.log}
      />
    </Layout>
  );
}
```

---

## 🔗 API Integration Deep Dive

### API Client Architecture

```
┌─────────────────────────────────────────┐
│         React Component                  │
│  const { data } = useUsers()            │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│      React Query Hook (useAPI.ts)       │
│  - Handles caching                      │
│  - Handles refetching                   │
│  - Handles deduplication                │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│      API Client (lib/api.ts)            │
│  - Axios instance                       │
│  - Token interceptor                    │
│  - Error handling                       │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│   Backend API (http://localhost:3000)   │
└─────────────────────────────────────────┘
```

### Making API Calls

**Option 1: Using Hooks (Recommended)**
```typescript
import { useUsers, useCreateProduct } from '@/hooks/useApi';

export default function MyPage() {
  // For queries (GET)
  const { data, isLoading, error } = useUsers();

  // For mutations (POST, PUT, DELETE)
  const { mutate: createProduct, isPending } = useCreateProduct();

  const handleCreate = async (product) => {
    createProduct(product, {
      onSuccess: () => console.log('Created!'),
      onError: (error) => console.error(error),
    });
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <p>Found {data.data.total} users</p>}
      
      <button onClick={() => handleCreate({})}>Create</button>
      {isPending && <p>Creating...</p>}
    </div>
  );
}
```

**Option 2: Direct API Call**
```typescript
import { apiClient } from '@/lib/api';

export default function MyPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiClient
      .getUsers()
      .then(response => setUsers(response.data.items))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {users.map(user => <div key={user.id}>{user.email}</div>)}
    </div>
  );
}
```

### Adding New API Methods

**Backend created endpoint**: `GET /api/v1/reports`

**Step 1: Add to API client (lib/api.ts)**
```typescript
async getReports(filters?: ReportFilters) {
  const response = await this.client.get('/reports', { params: filters });
  return response.data;
}
```

**Step 2: Create React Query hook (hooks/useApi.ts)**
```typescript
export function useReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => apiClient.getReports(filters),
  });
}
```

**Step 3: Use in component**
```typescript
import { useReports } from '@/hooks/useApi';

const { data: reports } = useReports({ startDate: '2024-01-01' });
```

---

## 🧠 State Management Patterns

### Global State (Authentication)
```typescript
// src/hooks/useAuth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setToken: (token) => set({ token }),
      login: async (email, password) => {
        const response = await apiClient.login(email, password);
        set({
          token: response.data.token,
          user: response.data.user,
          isAuthenticated: true,
        });
      },
      logout: () => set({
        token: null,
        user: null,
        isAuthenticated: false,
      }),
    }),
    { name: 'auth-store' },
  ),
);

// Usage in component
const { user, logout } = useAuthStore();
```

### Local Component State
```typescript
export default function MyComponent() {
  // Simple state
  const [count, setCount] = useState(0);
  
  // Object state
  const [form, setForm] = useState({ email: '', name: '' });
  
  // Reducer for complex logic
  const [state, dispatch] = useReducer(reducer, initialState);

  return <div onClick={() => setCount(c => c + 1)}>{count}</div>;
}
```

### Server State (React Query)
```typescript
// Automatically handled by React Query hooks
const { data, isLoading, error } = useUsers();
// React Query manages:
// - Caching
// - Refetching
// - Deduplication
// - Background updates
```

---

## 🧪 Testing Strategy

### Testing Setup

```bash
npm run test              # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

### Unit Tests (hooks)

```typescript
// tests/hooks/useApi.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useUsers } from '@/hooks/useApi';

describe('useUsers', () => {
  it('should fetch users', async () => {
    const { result } = renderHook(() => useUsers());
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toBeDefined();
  });
});
```

### Component Tests

```typescript
// tests/components/Layout.test.tsx
import { render, screen } from '@testing-library/react';
import Layout from '@/components/Layout';

describe('Layout', () => {
  it('should render navigation', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// tests/integration/userFlow.test.ts
describe('User Management Flow', () => {
  it('should create and display user', async () => {
    const { data } = await apiClient.createUser({
      email: 'test@example.com',
      name: 'Test User',
    });
    
    expect(data.id).toBeDefined();
  });
});
```

---

## ✅ Best Practices

### 1. Component Organization
```
✅ One component per file
✅ Export as default
✅ Props interface at top
✅ Clear prop names
✅ Proper TypeScript typing

❌ Multiple components in file
❌ Large component files (>300 lines)
❌ Unclear prop names
❌ Missing types
```

### 2. Naming Conventions
```typescript
// ✅ Good
MyComponent.tsx        // PascalCase for components
useMyHook.ts          // camelCase with 'use' prefix
my-constant.ts        // kebab-case for constants
interface MyProps {}  // PascalCase for types

// ❌ Bad
mycomponent.tsx
myHook.ts
MY_CONSTANT.ts
interface myProps {}
```

### 3. Error Handling
```typescript
// ✅ Good
try {
  const data = await apiClient.getUsers();
  setUsers(data);
} catch (error) {
  if (error instanceof ApiError) {
    showError(error.message);
  } else {
    showError('An unexpected error occurred');
  }
}

// ❌ Bad
apiClient.getUsers().then(setUsers);  // No error handling
```

### 4. TypeScript Usage
```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
}

function processUser(user: User): string {
  return user.email;
}

// ❌ Bad
function processUser(user: any): any {
  return user.email;
}
```

### 5. Component Performance
```typescript
// ✅ Good
import { memo } from 'react';

const UserCard = memo(({ user }: UserCardProps) => {
  return <div>{user.name}</div>;
});

// ❌ Bad
function UserCard({ user }) {
  // Rerenders unnecessarily
  return <div>{user.name}</div>;
}
```

### 6. React Patterns
```typescript
// ✅ Good - Controlled component
const [value, setValue] = useState('');
<input value={value} onChange={e => setValue(e.target.value)} />

// ❌ Bad - Uncontrolled component
<input defaultValue="" />

// ✅ Good - Effects for side effects
useEffect(() => {
  console.log('Mounted');
  return () => console.log('Unmounted');
}, []);

// ❌ Bad - Logic in render
function Component() {
  console.log('Renders every time');
}
```

---

## 📚 Common Patterns

### Pattern 1: Fetch and Display
```typescript
export default function UsersList() {
  const { data, isLoading, error } = useUsers();

  if (isLoading) return <DisplayLoading />;
  if (error) return <DisplayError error={error} />;
  if (!data?.data.items.length) return <DisplayEmpty />;

  return (
    <div>
      {data.data.items.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

### Pattern 2: Create with Modal
```typescript
export default function ProductsPage() {
  const [showModal, setShowModal] = useState(false);
  const { mutate: create } = useCreateProduct();

  const handleCreate = (product) => {
    create(product, {
      onSuccess: () => {
        setShowModal(false);
        queryClient.invalidateQueries({ queryKey: ['products'] });
      },
    });
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>Add Product</button>
      {showModal && <CreateProductModal onClose={() => setShowModal(false)} />}
    </>
  );
}
```

### Pattern 3: Form Handling
```typescript
export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { mutate: login, isPending } = useLogin();

  const handleChange = (e) => {
    setForm(p => ({
      ...p,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        disabled={isPending}
      />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## 🔍 Debugging

### Browser DevTools

1. **React DevTools** (browser extension)
   - Inspect component tree
   - Check props/state
   - Track renders

2. **React Query DevTools** (built-in)
   - View queries state
   - See cache
   - Trigger refetch

3. **Network Tab**
   - See API calls
   - Check response status
   - View request/response data

### Console Debugging

```typescript
// Check auth status
console.log(useAuthStore.getState());

// Check query state
console.log(queryClient.getQueryState(['users']));

// Get user from store
const { user } = useAuthStore();
console.log('Current user:', user);
```

---

## 🚀 Ready to Code?

You're all set! Start with:

1. **Review** [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. **Run** `npm run dev`
3. **Explore** existing pages in `src/pages/`
4. **Ask** if you have questions
5. **Build** amazing features!

---

**Good luck! Happy coding! 🎉**
