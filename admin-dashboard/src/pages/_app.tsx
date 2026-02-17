import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/styles/globals.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Pages that don't require authentication
const publicPages = ['/login', '/_error', '/404'];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { loadUser } = useAuthStore();

  // Load user on app initialization
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Determine if current page is public
  const isPublicPage = publicPages.includes(router.pathname);

  return (
    <QueryClientProvider client={queryClient}>
      {isPublicPage ? (
        // Render public pages without protection
        <Component {...pageProps} />
      ) : (
        // Wrap protected pages with ProtectedRoute
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      )}
    </QueryClientProvider>
  );
}
