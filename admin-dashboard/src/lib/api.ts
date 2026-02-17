import axios, { AxiosInstance, AxiosError } from 'axios';

interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL) {
    this.client = axios.create({
      baseURL,
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<any>) => {
        const apiError: ApiError = {
          status: error.response?.status || 500,
          message: error.response?.data?.message || error.message,
          code: error.response?.data?.code,
          details: error.response?.data?.details,
        };
        return Promise.reject(apiError);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearToken() {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/auth/logout');
    this.clearToken();
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  // User endpoints
  async getUsers(limit: number = 50, offset: number = 0) {
    const response = await this.client.get('/users', { params: { limit, offset } });
    return response.data;
  }

  async getUser(userId: string) {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  async searchUsers(query: string, limit: number = 20) {
    const response = await this.client.get('/users/search', { params: { query, limit } });
    return response.data;
  }

  // Admin endpoints
  async getAnalytics() {
    const response = await this.client.get('/admin/analytics');
    return response.data;
  }

  async getSuspiciousActivity() {
    const response = await this.client.get('/admin/suspicious-activity');
    return response.data;
  }

  async getSystemHealth() {
    const response = await this.client.get('/admin/health');
    return response.data;
  }

  async getSettings() {
    const response = await this.client.get('/admin/settings');
    return response.data;
  }

  async updateSettings(settings: any) {
    const response = await this.client.put('/admin/settings', settings);
    return response.data;
  }

  async blockUser(userId: string, reason: string) {
    const response = await this.client.post(`/admin/users/${userId}/block`, { reason });
    return response.data;
  }

  async unblockUser(userId: string) {
    const response = await this.client.post(`/admin/users/${userId}/unblock`);
    return response.data;
  }

  // Order endpoints
  async getOrders(limit: number = 50, offset: number = 0) {
    const response = await this.client.get('/admin/orders', { params: { limit, offset } });
    return response.data;
  }

  async getOrder(orderId: string) {
    const response = await this.client.get(`/orders/${orderId}`);
    return response.data;
  }

  // Store endpoints
  async getProducts(limit: number = 50, offset: number = 0) {
    const response = await this.client.get('/store', { params: { limit, offset } });
    return response.data;
  }

  async getProduct(productId: string) {
    const response = await this.client.get(`/store/${productId}`);
    return response.data;
  }

  async createProduct(productData: any) {
    const response = await this.client.post('/store/products', productData);
    return response.data;
  }

  async updateProduct(productId: string, productData: any) {
    const response = await this.client.put(`/store/${productId}`, productData);
    return response.data;
  }

  async deleteProduct(productId: string) {
    const response = await this.client.delete(`/store/${productId}`);
    return response.data;
  }

  // Leaderboard endpoints
  async getLeaderboard(type: 'weekly' | 'monthly' | 'all-time' = 'weekly') {
    const response = await this.client.get(`/leaderboard/${type}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export type { ApiError };
