import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// Query Keys
export const queryKeys = {
  auth: ['auth'],
  profile: ['auth', 'profile'],
  users: ['users'],
  user: (id: string) => ['users', id],
  analytics: ['admin', 'analytics'],
  health: ['admin', 'health'],
  settings: ['admin', 'settings'],
  orders: ['orders'],
  order: (id: string) => ['orders', id],
  products: ['products'],
  product: (id: string) => ['products', id],
  leaderboard: (type: string) => ['leaderboard', type],
  suspicious: ['admin', 'suspicious-activity'],
};

// Auth Hooks
export function useLogin() {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiClient.login(credentials.email, credentials.password),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => apiClient.getProfile(),
  });
}

// User Hooks
export function useUsers(limit: number = 50, offset: number = 0) {
  return useQuery({
    queryKey: [...queryKeys.users, limit, offset],
    queryFn: () => apiClient.getUsers(limit, offset),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => apiClient.getUser(userId),
  });
}

export function useSearchUsers(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...queryKeys.users, 'search', query],
    queryFn: () => apiClient.searchUsers(query),
    enabled: enabled && query.length > 0,
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      apiClient.blockUser(userId, reason),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => apiClient.unblockUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

// Analytics Hooks
export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: () => apiClient.getAnalytics(),
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiClient.getSystemHealth(),
    refetchInterval: 30000, // Refetch every 30s
  });
}

export function useSuspiciousActivity() {
  return useQuery({
    queryKey: queryKeys.suspicious,
    queryFn: () => apiClient.getSuspiciousActivity(),
  });
}

// Settings Hooks
export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => apiClient.getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: any) => apiClient.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
  });
}

// Order Hooks
export function useOrders(limit: number = 50, offset: number = 0) {
  return useQuery({
    queryKey: [...queryKeys.orders, limit, offset],
    queryFn: () => apiClient.getOrders(limit, offset),
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.order(orderId),
    queryFn: () => apiClient.getOrder(orderId),
  });
}

// Product Hooks
export function useProducts(limit: number = 50, offset: number = 0) {
  return useQuery({
    queryKey: [...queryKeys.products, limit, offset],
    queryFn: () => apiClient.getProducts(limit, offset),
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: queryKeys.product(productId),
    queryFn: () => apiClient.getProduct(productId),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productData: any) => apiClient.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productData: any) => apiClient.updateProduct(productId, productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.product(productId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => apiClient.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

// Leaderboard Hooks
export function useLeaderboard(type: 'weekly' | 'monthly' | 'all-time' = 'weekly') {
  return useQuery({
    queryKey: queryKeys.leaderboard(type),
    queryFn: () => apiClient.getLeaderboard(type),
  });
}
