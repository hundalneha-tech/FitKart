# Admin Dashboard Quick Reference

**Quick lookup guide for FitKart Admin Dashboard development**

---

## 🚀 Quick Start (60 seconds)

```bash
cd admin-dashboard
cp .env.example .env.local
npm install
npm run dev
# Visit http://localhost:3001
# Login: admin@fitkart.club / AdminPass123!
```

---

## 📝 Common Commands

| Purpose | Command |
|---------|---------|
| **Start Dev** | `npm run dev` |
| **Build** | `npm run build` |
| **Production** | `npm start` |
| **Lint** | `npm run lint` |
| **Format** | `npm run format` |
| **Type Check** | `npm run type-check` |
| **Test** | `npm run test` |

---

## 🧩 Creating New Components

### 1. Basic Component
```typescript
// src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export default function MyComponent({ title, onClick }: MyComponentProps) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
  );
}
```

### 2. Using in Page
```typescript
// src/pages/mypage.tsx
import Layout from '@/components/Layout';
import MyComponent from '@/components/MyComponent';

export default function MyPage() {
  return (
    <Layout>
      <MyComponent title="Welcome" />
    </Layout>
  );
}
```

---

## 🔗 API Integration

### Using Hooks
```typescript
import { useUsers, useAnalytics } from '@/hooks/useApi';

const { data, isLoading, error } = useUsers();
const { data: analytics } = useAnalytics();
```

### Direct API Call
```typescript
import { apiClient } from '@/lib/api';

const response = await apiClient.getUsers();
```

### All Available Hooks

#### Auth (3)
- `useLogin()` - Login
- `useLogout()` - Logout
- `useProfile()` - Current user

#### Users (5)
- `useUsers()` - Get all users
- `useUser(id)` - Get single user
- `useSearchUsers(query)` - Search
- `useBlockUser()` - Block user
- `useUnblockUser()` - Unblock user

#### Analytics (3)
- `useAnalytics()` - Platform stats
- `useSystemHealth()` - System status
- `useSuspiciousActivity()` - Flagged activities

#### Orders (2)
- `useOrders()` - Get all orders
- `useOrder(id)` - Get order details

#### Products (5)
- `useProducts()` - Get all products
- `useProduct(id)` - Get product
- `useCreateProduct()` - Create
- `useUpdateProduct()` - Update
- `useDeleteProduct()` - Delete

#### Leaderboard (1)
- `useLeaderboard(type)` - Rankings

---

## 🎨 Tailwind CSS Classes

### Text
```html
<!-- Size -->
<p class="text-sm">Small</p>
<p class="text-base">Base</p>
<p class="text-lg">Large</p>
<p class="text-2xl">2XL</p>

<!-- Weight -->
<p class="font-normal">Normal</p>
<p class="font-semibold">Semibold</p>
<p class="font-bold">Bold</p>

<!-- Color -->
<p class="text-white">White</p>
<p class="text-gray-300">Gray</p>
<p class="text-blue-600">Blue</p>
<p class="text-green-500">Green</p>
<p class="text-red-500">Red</p>
```

### Layout
```html
<!-- Flexbox -->
<div class="flex gap-4">
<div class="flex flex-col gap-2">
<div class="flex justify-between">

<!-- Grid -->
<div class="grid grid-cols-3 gap-4">
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

<!-- Spacing -->
<div class="p-4">Padding</div>
<div class="m-4">Margin</div>
<div class="mb-8">Margin bottom</div>
```

### Backgrounds & Styling
```html
<!-- Backgrounds -->
<div class="bg-gray-900">Dark</div>
<div class="bg-gray-800">Card</div>
<div class="bg-blue-600">Primary</div>

<!-- Rounded -->
<div class="rounded">Small radius</div>
<div class="rounded-lg">Large radius</div>
<div class="rounded-full">Full (circle)</div>

<!-- Shadows -->
<div class="shadow">Small shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large</div>

<!-- Borders -->
<div class="border border-gray-700">Border</div>
<div class="border-t-2 border-blue-600">Top border</div>
```

### Responsive
```html
<!-- Mobile first -->
<div class="text-sm md:text-base lg:text-lg">
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<div class="hidden md:block">Hidden on mobile</div>
<div class="block md:hidden">Hidden on desktop</div>
```

---

## 🧠 State Management

### Using Zustand (Auth)
```typescript
import { useAuthStore } from '@/hooks/useAuth';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>User: {user?.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => login(email, password)}>Login</button>
      )}
    </div>
  );
}
```

### Using React Query (Data)
```typescript
import { useUsers } from '@/hooks/useApi';

export default function UsersList() {
  const { data, isLoading, error } = useUsers();
  
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  
  return (
    <div>
      {data?.data.items.map(user => (
        <div key={user.id}>{user.email}</div>
      ))}
    </div>
  );
}
```

---

## 📊 Charts with Recharts

### Line Chart
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const data = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 120 },
  { name: 'Mar', value: 150 },
];

export default function Chart() {
  return (
    <LineChart width={500} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#3b82f6" />
    </LineChart>
  );
}
```

### Bar Chart
```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Mon', users: 50, revenue: 200 },
  { name: 'Tue', users: 60, revenue: 250 },
];

export default function Chart() {
  return (
    <BarChart width={500} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="users" fill="#3b82f6" />
      <Bar dataKey="revenue" fill="#10b981" />
    </BarChart>
  );
}
```

---

## 🎬 Forms & Input

### Basic Form
```typescript
import { useState } from 'react';

export default function MyForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(email, password);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 bg-gray-700 text-white rounded"
      />
      <textarea
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 bg-gray-700 text-white rounded"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
}
```

---

## 🔐 Authentication Flow

```typescript
// Login
const { login } = useAuthStore();
await login(email, password);

// Automatically:
// 1. Sends request to backend
// 2. Stores token in localStorage
// 3. Sets API Authorization header
// 4. Redirects to /dashboard

// Protected pages check:
if (!useAuthStore().isAuthenticated) {
  router.push('/login');
}

// Logout
const { logout } = useAuthStore();
logout();
// Redirects to /login automatically
```

---

## 📝 TypeScript Tips

### Type API Responses
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  blockedAt?: Date;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Usage
const response: ApiResponse<User[]> = await getUsers();
```

### Component Props
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  label,
  onClick,
  disabled = false,
  className = '',
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 ${className}`}
    >
      {label}
    </button>
  );
}
```

---

## 🐛 Debugging

### Console Logging
```typescript
console.log('Value:', value);
console.error('Error:', error);
console.warn('Warning:', warning);

// React Query
const { data, error, status } = useUsers();
console.log('Status:', status); // 'loading' | 'error' | 'success'
```

### DevTools

**React Query DevTools** (already configured):
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function App() {
  return (
    <>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```

---

## 🌐 Environment Variables

### Local Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=dev-secret-not-for-production
```

### Production (.env.production)
```env
NEXT_PUBLIC_API_URL=https://www.fitkart.club/api/v1
NEXTAUTH_URL=https://admin.fitkart.club
NEXTAUTH_SECRET=<strong-secret>
NODE_ENV=production
```

---

## 📂 File Locations

| What | Location |
|------|----------|
| Pages | `src/pages/` |
| Components | `src/components/` |
| Hooks | `src/hooks/` |
| API Client | `src/lib/api.ts` |
| Auth Store | `src/hooks/useAuth.ts` |
| Types | `src/types/` |
| Styles | `src/styles/` |
| Tests | `tests/` |

---

## ⚡ Performance Tips

```typescript
// 1. Memoize components
import { memo } from 'react';
export default memo(MyComponent);

// 2. Use useCallback for functions
import { useCallback } from 'react';
const handleClick = useCallback(() => {}, [dependencies]);

// 3. React Query deduplication
const { data } = useUsers(); // Cached automatically

// 4. Next.js Image optimization
import Image from 'next/image';
<Image src="/logo.png" width={100} height={100} alt="Logo" />

// 5. Code splitting (automatic)
export default function Page() { } // Splits automatically
```

---

## 🚨 Common Issues & Solutions

### API Not Connected
```
✗ Can't connect to backend
Solution: Check NEXT_PUBLIC_API_URL and ensure backend running
```

### Port Conflict
```
✗ Port 3001 already in use
Solution: npm run dev uses port 3002, or kill process: lsof -i :3001
```

### Build Fails
```
✗ TypeScript errors
Solution: npm run type-check, then npm run build
```

### Styles Not Loading
```
✗ Tailwind CSS not working
Solution: Restart dev server (kill and npm run dev)
```

---

## 📚 Documentation Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Recharts](https://recharts.org/)

---

## 🆘 Getting Help

1. Check this guide first
2. Read [SETUP_GUIDE.md](./SETUP_GUIDE.md)
3. Check [../API_DOCUMENTATION.md](../API_DOCUMENTATION.md)
4. Search GitHub issues
5. Ask in Slack/Discord

---

**Last Updated**: February 17, 2026  
**Version**: 1.0.0
