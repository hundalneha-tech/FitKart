# FitKart Admin Dashboard - Troubleshooting Guide

**Solutions to common issues you might encounter during development and deployment**

---

## Table of Contents

- [Installation Issues](#installation-issues)
- [Development Server Issues](#development-server-issues)
- [API Connection Issues](#api-connection-issues)
- [Build Issues](#build-issues)
- [Type Checking Issues](#type-checking-issues)
- [Styling Issues](#styling-issues)
- [Authentication Issues](#authentication-issues)
- [Performance Issues](#performance-issues)
- [Deployment Issues](#deployment-issues)
- [Common Error Messages](#common-error-messages)

---

## Installation Issues

### npm install fails

**Problem**: `npm install` exits with error or hangs

**Solutions**:

```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Delete lock files and reinstall
rm -rf node_modules package-lock.json
npm install

# 3. Use different registry
npm install --registry https://registry.npmjs.org/

# 4. Install with legacy peer deps (if needed)
npm install --legacy-peer-deps

# 5. Check Node version
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

### Missing dependencies

**Problem**: "Module not found" errors after install

**Solutions**:

```bash
# Verify installation
npm list react next typescript

# Reinstall specific package
npm install react@18.2 --save

# Reinstall all
rm -rf node_modules
npm install
```

### Version conflicts

**Problem**: "Conflicting peer dependencies" warnings

**Solutions**:

```bash
# Check for conflicts
npm ls

# Use compatible versions
npm install --save react@18 next@14 typescript@5

# Force resolution
npm install --save --force
```

---

## Development Server Issues

### Port Already in Use

**Problem**: 
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solutions**:

**macOS/Linux**:
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or kill all node processes
killall node
```

**Windows PowerShell**:
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or find and kill node
Get-Process node | Stop-Process -Force
```

### Dev Server Won't Start

**Problem**: `npm run dev` exits immediately or shows errors

**Solutions**:

```bash
# 1. Check for errors
npm run dev  # Read the full error message

# 2. Clear Next.js cache
rm -rf .next

# 3. Verify environment file
cat .env.local | head

# 4. Check tsconfig.json syntax
npm run type-check

# 5. Clear all and restart
rm -rf .next node_modules
npm install
npm run dev
```

### Hot Reload Not Working

**Problem**: Changes don't appear when you save files

**Solutions**:

```bash
# 1. Restart dev server
# Ctrl+C then: npm run dev

# 2. Check file permissions
# Make sure you can write to src/ directory

# 3. Verify .env.local exists
ls -la .env.local

# 4. Clear cache
rm -rf .next
npm run dev

# 5. Check for file system issues
# Try changing a different file
```

### Localhost connection refused

**Problem**: Cannot reach `http://localhost:3001`

**Solutions**:

```bash
# 1. Verify dev server running
npm run dev
# Should show: ready - started on...

# 2. Check firewall
# Allow node.js or port 3001 through firewall

# 3. Use alternative URL
# Try: http://127.0.0.1:3001

# 4. Check for port binding issues
netstat -tuln | grep 3001

# 5. Use different port
PORT=3002 npm run dev
```

---

## API Connection Issues

### Backend API Not Responding

**Problem**:
```
Failed to connect to http://localhost:3000/api/v1
```

**Solutions**:

```bash
# 1. Verify backend is running
curl http://localhost:3000/health

# 2. Check NEXT_PUBLIC_API_URL
cat .env.local | grep NEXT_PUBLIC_API_URL

# 3. Restart backend
# In backend terminal:
cd ../backend
npm run dev

# 4. Check firewall
# Ensure port 3000 is accessible

# 5. Verify API endpoint
curl http://localhost:3000/api/v1/users
# Should return 401 if not authenticated
```

### CORS Errors

**Problem**:
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions**:

```bash
# 1. Check backend CORS config
# Backend should allow requests from http://localhost:3001

# 2. Verify API URL
# .env.local should have:
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# 3. Check browser console (Network tab)
# Look for requests with CORS issues

# 4. Restart backend with CORS enabled
# Backend should have CORS middleware

# 5. For production, use HTTPS
NEXT_PUBLIC_API_URL=https://www.fitkart.club/api/v1
```

### API Timeout

**Problem**:
```
Error: Request timeout after 30000ms
```

**Solutions**:

```bash
# 1. Check backend is responding
curl -v http://localhost:3000/api/v1/users

# 2. Increase timeout in .env.local
NEXT_PUBLIC_API_TIMEOUT=60000  # 60 seconds

# 3. Check network connectivity
ping localhost:3000

# 4. Restart backend
cd ../backend && npm run dev

# 5. Check backend logs for errors
# Look for database connection issues
```

### 401 Unauthorized Errors

**Problem**:
```
Error: Unauthorized (401)
```

**Solutions**:

```typescript
// 1. Check if logged in
const { isAuthenticated } = useAuthStore();
console.log('Authenticated:', isAuthenticated);

// 2. Verify token in localStorage
console.log(localStorage.getItem('auth-store'));

// 3. Check token format
// Should be JWT token starting with eyJ...

// 4. Login again
const { login } = useAuthStore();
await login('admin@fitkart.club', 'AdminPass123!');

// 5. Clear auth and restart
localStorage.clear();
localStorage.removeItem('auth-store');
// Reload page and login
```

### API Returns Wrong Data

**Problem**: API response format doesn't match expected types

**Solutions**:

```bash
# 1. Check API response format
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/users | jq

# 2. Review API_DOCUMENTATION.md
cat ../API_DOCUMENTATION.md | grep -A 10 "GET /users"

# 3. Check TypeScript types
cat src/types/index.ts

# 4. Log response data
console.log('API Response:', response);

# 5. Update TypeScript types if needed
# Edit src/types/index.ts
```

---

## Build Issues

### Build Fails

**Problem**:
```
Error: Build failed
```

**Solutions**:

```bash
# 1. Run type check first
npm run type-check
# Fix any TypeScript errors

# 2. Run linter
npm run lint
# Fix any ESLint errors

# 3. Clear cache
rm -rf .next

# 4. Try building again
npm run build

# 5. Check Node version
node --version  # Should be 18.0.0+

# 6. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Build Takes Too Long

**Problem**: Build takes >5 minutes or hangs

**Solutions**:

```bash
# 1. Check system resources
top  # or Task Manager on Windows

# 2. Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build

# 3. Use SWC (faster than Babel)
# Already enabled in next.config.js

# 4. Check for large node_modules
du -sh node_modules

# 5. Disable Turbopack if issues
# Remove turbo config or use experimental build
```

### Static Files Not Included

**Problem**: Images, fonts, or assets not in build

**Solutions**:

```bash
# 1. Verify files in public/ directory
ls -la public/

# 2. Reference correctly in code
// ✅ Correct
import Image from 'next/image';
<Image src="/logo.png" width={100} height={100} />

// ❌ Wrong
<img src="logo.png" />  // Should be /logo.png

# 3. Check next.config.js
cat next.config.js | grep -i public

# 4. Verify image domains
// next.config.js should include:
// images: { domains: ['localhost', 'fitkart.club'] }
```

---

## Type Checking Issues

### TypeScript Errors

**Problem**: `npm run type-check` shows errors

**Solutions**:

```bash
# 1. Run type check to see all errors
npm run type-check

# 2. Explicitly type everything
interface User {
  id: string;
  email: string;
}

const user: User = { id: '1', email: 'test@example.com' };

# 3. Use type assertion if needed
const data = response as User[];

# 4. Update tsconfig.json
# Verify strict mode is enabled:
# "strict": true

# 5. Import types correctly
import type { User } from './types';
```

### "any" Type Warnings

**Problem**: ESLint warns about "any" types

**Solutions**:

```typescript
// ❌ Avoid
const data: any = response;

// ✅ Better - Create proper types
interface ApiResponse {
  data: Array<{
    id: string;
    name: string;
  }>;
}

const data: ApiResponse = response;

// ✅ Or use generics
function handleResponse<T>(response: Response): Promise<T> {
  return response.json();
}
```

### Missing Type Definitions

**Problem**:
```
TS7016: Could not find a declaration file for module
```

**Solutions**:

```bash
# 1. Install types package
npm install --save-dev @types/package-name

# 2. Add to tsconfig.json if needed
"typeRoots": ["./node_modules/@types"]

# 3. Create declaration file
# src/types/custom.d.ts
declare module 'package-name' {
  export function myFunction(): void;
}

# 4. Use // @ts-ignore (last resort)
// @ts-ignore
const data = unknownFunction();
```

---

## Styling Issues

### Tailwind Classes Not Working

**Problem**: Tailwind CSS classes not applied

**Solutions**:

```bash
# 1. Restart dev server
npm run dev

# 2. Verify tailwind.config.js
cat tailwind.config.js | grep content

# 3. Check that paths are correct
# tailwind.config.js should include:
# content: ['./src/**/*.{js,jsx,ts,tsx}']

# 4. Clear cache
rm -rf .next
npm run dev

# 5. Verify PostCSS config
cat postcss.config.js

# 6. Hard refresh browser
# Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Colors Not Displaying

**Problem**: Custom theme colors not working

**Solutions**:

```bash
# 1. Check tailwind.config.js colors
cat tailwind.config.js | grep -A 10 "colors:"

# 2. Use correct color format
// ✅ Correct
className="bg-primary-600 text-white"

// ❌ Wrong
className="bg-primary text-white"

# 3. Verify color exists in theme
# Check tailwind.config.js for: primary: { 600: '#...' }

# 4. Clear Tailwind cache
rm -rf .next
npm run dev
```

### Dark Mode Not Working

**Problem**: Dark mode classes not applied

**Solutions**:

```typescript
// 1. Verify dark mode in tailwind.config.js
// Should have: darkMode: 'class'

// 2. Use dark mode classes
className="bg-white dark:bg-gray-900 text-black dark:text-white"

// 3. Check HTML element has dark class
// Add to body or html element:
<html className="dark">

// 4. Toggle dark mode
document.documentElement.classList.toggle('dark');
```

### CSS Not Minified

**Problem**: CSS file is large in production

**Solutions**:

```bash
# 1. Verify Tailwind purging
# tailwind.config.js should have proper content paths

# 2. Check production build
npm run build

# 3. Analyze CSS size
# Check .next/static/ directory

# 4. Enable CSS optimization
# Usually automatic in Next.js

# 5. Use CSS modules for large components
// component.module.css
.container { /* styles */ }

// component.tsx
import styles from './component.module.css';
<div className={styles.container}>
```

---

## Authentication Issues

### Cannot Login

**Problem**: Login fails or redirects to login page

**Solutions**:

```typescript
// 1. Check credentials
// Default: admin@fitkart.club / AdminPass123!
// Verify backend has this user

// 2. Check token storage
console.log(localStorage.getItem('auth-store'));

// 3. Verify API connection
const response = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@fitkart.club',
    password: 'AdminPass123!',
  }),
});
console.log(await response.json());

// 4. Check backend logs
// Look for authentication errors

// 5. Reset password in backend database
// Update user password in PostgreSQL
```

### Session Expires Immediately

**Problem**: Logged out right after login

**Solutions**:

```typescript
// 1. Check NEXTAUTH_SECRET
process.env.NEXTAUTH_SECRET  // Should be set in .env.local

// 2. Check token expiration
// Backend tokens might be expiring too quickly

// 3. Verify token storage
// Check localStorage for token

// 4. Check NEXTAUTH_URL
// .env.local should have: NEXTAUTH_URL=http://localhost:3001

// 5. Clear auth and try again
localStorage.removeItem('auth-store');
// Reload and login again
```

### Token Not Sent with API Requests

**Problem**: 401 errors on authenticated endpoints

**Solutions**:

```bash
# 1. Check API client interceptor
cat src/lib/api.ts | grep -A 5 "Authorization"

# 2. Verify token in localStorage
console.log(localStorage.getItem('auth-store'));

# 3. Check useAuthStore hook
const { token } = useAuthStore();
console.log('Token:', token);

# 4. Verify Axios header format
# Should be: Authorization: Bearer <token>

# 5. Check backend CORS headers
# Verify backend allows Authorization header
```

---

## Performance Issues

### App is Slow

**Problem**: Dashboard loads slowly or feels sluggish

**Solutions**:

```bash
# 1. Check Network tab
# Look for slow API calls or large payloads

# 2. Check React DevTools Profiler
# Identify slow components

# 3. Check bundle size
npm run build
# Look at `.next/static/` size

# 4. Enable React Query DevTools
// Add to _app.tsx or root component:
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
<ReactQueryDevtools initialIsOpen={false} />

# 5. Optimize images
# Use Next.js Image component

# 6. Memoize expensive components
import { memo } from 'react';
export default memo(MyComponent);

# 7. Use Code Splitting
// Automatic in Next.js, but verify:
// Each page in pages/ is split separately
```

### High Memory Usage

**Problem**: npm run dev or build uses lots of memory

**Solutions**:

```bash
# 1. Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run dev

# 2. Check for memory leaks
# Stop dev server and check process
top

# 3. Clear cache
rm -rf .next node_modules
npm install

# 4. Restart IDE/Terminal
# Sometimes terminal accumulates memory

# 5. Use production build
npm run build && npm start
# More efficient than dev mode
```

### API Calls Too Slow

**Problem**: Requests take >1 second

**Solutions**:

```bash
# 1. Check Network tab timing
# See where time is spent

# 2. Optimize backend query
# Check API_DOCUMENTATION.md for endpoint performance

# 3. Use React Query caching
// Queries are cached automatically
const { data, isLoading } = useUsers();

# 4. Implement pagination
// Don't load all data at once

# 5. Add loading states
// Show spinner while loading
```

---

## Deployment Issues

### Cannot Deploy to Vercel

**Problem**: Deployment fails on Vercel

**Solutions**:

```bash
# 1. Verify environment variables
# Set in Vercel project dashboard:
# - NEXT_PUBLIC_API_URL
# - NEXTAUTH_URL
# - NEXTAUTH_SECRET

# 2. Check build logs
# Vercel shows build errors in Deployments tab

# 3. Test production build locally
npm run build
npm start

# 4. Ensure Node version is compatible
# Vercel uses Node 18+ by default

# 5. Check for secrets in code
# Don't commit sensitive data
grep -r "password\|secret\|token" src/
```

### Docker Build Fails

**Problem**: `docker build` exits with error

**Solutions**:

```bash
# 1. Review Dockerfile
cat Dockerfile

# 2. Check Docker installed
docker --version

# 3. Try building with verbose output
docker build --progress=plain -t fitkart-admin .

# 4. Review Node version in Dockerfile
# Should use node:18-alpine or compatible

# 5. Check disk space
df -h

# 6. Rebuild without cache
docker build --no-cache -t fitkart-admin .
```

### Docker Container Won't Start

**Problem**: `docker run` exits immediately

**Solutions**:

```bash
# 1. Check logs
docker logs <container-id>

# 2. Run with terminal
docker run -it fitkart-admin /bin/sh

# 3. Check port binding
docker run -p 3001:3001 fitkart-admin

# 4. Verify environment variables
docker run -e NEXT_PUBLIC_API_URL=... fitkart-admin

# 5. Check Dockerfile CMD
# Should be: CMD ["npm", "start"]
```

---

## Common Error Messages

### "React is not defined"

**Problem**:
```
ReferenceError: React is not defined
```

**Solution**: Import React at top of file
```typescript
import React from 'react';
// Or use JSX without importing (Next.js 13+)
```

### "Cannot find module"

**Problem**:
```
Error: Cannot find module '@/components/MyComponent'
```

**Solution**:
```bash
# 1. Check path exists
ls src/components/MyComponent.tsx

# 2. Verify tsconfig path alias
cat tsconfig.json | grep '@/'

# 3. Check file extension
# Should be .tsx or .ts
```

### "Unexpected token"

**Problem**:
```
SyntaxError: Unexpected token <
```

**Solution**: Check JSX is in .tsx file (not .ts)

### "Property does not exist"

**Problem**:
```
Property 'email' does not exist on type 'Object'
```

**Solution**: Add proper TypeScript type
```typescript
interface User {
  email: string;
}

const user: User = { email: 'test@example.com' };
```

### ESLint errors

**Problem**: Linting errors prevent build

**Solutions**:
```bash
# 1. See all errors
npm run lint

# 2. Fix automatically
npm run lint:fix

# 3. Format code
npm run format

# 4. Ignore specific error (last resort)
// eslint-disable-next-line
const data: any = response;
```

### "useXXX called outside a component"

**Problem**:
```
React Hook "useUsers" is called outside of a component
```

**Solution**: Hooks must be called inside components
```typescript
// ❌ Wrong
const { data } = useUsers();  // At module level

export default function Component() {
  return <div>{data}</div>;
}

// ✅ Correct
export default function Component() {
  const { data } = useUsers();  // Inside component
  return <div>{data}</div>;
}
```

---

## Debug Mode

### Enable Debug Logging

```typescript
// src/lib/api.ts
// Add to Axios instance:
client.interceptors.response.use(
  (response) => {
    console.log('[API]', response.config.method, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('[API Error]', error.message);
    return Promise.reject(error);
  }
);
```

### Use React DevTools

```bash
# 1. Install React DevTools browser extension
# Chrome: https://chrome.google.com/webstore
# Firefox: https://addons.mozilla.org/

# 2. Open DevTools (F12)

# 3. Go to React tab

# 4. Inspect components and state
```

### Browser Console Tricks

```javascript
// Check auth state
console.log(localStorage);

// Check React Query
console.log(window.queryCache);

// Check Zustand store
import { useAuthStore } from '@/hooks/useAuth';
console.log(useAuthStore.getState());
```

---

## Reaching Out for Help

If you're stuck:

1. **Check this guide** - Many issues are covered here
2. **Google the error** - Usually others have faced it
3. **Check docs**:
   - [Next.js Docs](https://nextjs.org/docs)
   - [React Docs](https://react.dev)
   - [TypeScript Docs](https://www.typescriptlang.org/)
4. **Check Backend API** - Might be an API issue
5. **Ask Team** - In Slack or Discord

---

## Quick Fixes Checklist

- [ ] Restart dev server: `npm run dev`
- [ ] Clear cache: `rm -rf .next`
- [ ] Reinstall deps: `rm -rf node_modules && npm install`
- [ ] Check environment: `cat .env.local`
- [ ] Verify backend running: `curl http://localhost:3000/health`
- [ ] Check browser console for errors
- [ ] Hard refresh browser: Cmd+Shift+R or Ctrl+Shift+R
- [ ] Run type check: `npm run type-check`
- [ ] Run linter: `npm run lint:fix`

---

**Last Updated**: February 17, 2026  
**Version**: 1.0.0

**Found an issue not listed here?** Add it to this guide and help others!
