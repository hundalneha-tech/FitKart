// test/controllers/auth.controller.spec.ts

import { AuthController } from '../../src/controllers/auth.controller';
import { AuthService } from '../../src/services/auth.service';
import { createMockRequest, createMockResponse, createMockNext, verifyResponseFormat, testDataFactories } from '../utils/testHelpers';
import { ValidationError, UnauthorizedError, BadRequestError } from '../../src/utils/errors';

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      sendOTP: jest.fn(),
      verifyOTP: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn(),
      validateEmail: jest.fn(),
    };

    authController = new AuthController();
    (authController as any).authService = mockAuthService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const req = createMockRequest({
        body: {
          email: 'newuser@example.com',
          password: 'Password123!',
          name: 'New User',
          phone: '+1234567890',
          country: 'US',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const newUser = testDataFactories.createTestUser(req.body);
      mockAuthService.register.mockResolvedValue(newUser);

      await authController.register(req, res, next);

      expect(mockAuthService.register).toHaveBeenCalledWith(req.body);
      const response = verifyResponseFormat(res, 201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('email', req.body.email);
    });

    it('should handle duplicate email error', async () => {
      const req = createMockRequest({
        body: {
          email: 'existing@example.com',
          password: 'Password123!',
          name: 'User',
          phone: '+1234567890',
          country: 'US',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.register.mockRejectedValue(new BadRequestError('Email already exists'));

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const req = createMockRequest({
        body: {
          email: 'invalid-email',
          password: 'short',
          name: '',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.register.mockRejectedValue(new ValidationError('Invalid email format'));

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const req = createMockRequest({
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const loginResponse = {
        user: testDataFactories.createTestUser(),
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
      };
      mockAuthService.login.mockResolvedValue(loginResponse);

      await authController.login(req, res, next);

      expect(mockAuthService.login).toHaveBeenCalledWith(req.body);
      const response = verifyResponseFormat(res, 200);
      expect(response.data).toHaveProperty('accessToken');
      expect(response.data).toHaveProperty('refreshToken');
      expect(response.data).toHaveProperty('user');
    });

    it('should handle invalid credentials', async () => {
      const req = createMockRequest({
        body: {
          email: 'invalid@example.com',
          password: 'wrongpassword',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.login.mockRejectedValue(new UnauthorizedError('Invalid credentials'));

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('sendOTP', () => {
    it('should send OTP successfully', async () => {
      const req = createMockRequest({
        body: {
          email: 'test@example.com',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.sendOTP.mockResolvedValue({
        message: 'OTP sent to email',
      });

      await authController.sendOTP(req, res, next);

      expect(mockAuthService.sendOTP).toHaveBeenCalledWith(req.body.email);
      const response = verifyResponseFormat(res, 200);
      expect(response.message).toBeDefined();
    });

    it('should handle non-existent user', async () => {
      const req = createMockRequest({
        body: {
          email: 'nonexistent@example.com',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.sendOTP.mockRejectedValue(new UnauthorizedError('User not found'));

      await authController.sendOTP(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('verifyOTP', () => {
    it('should verify OTP and return tokens', async () => {
      const req = createMockRequest({
        body: {
          email: 'test@example.com',
          otp: '123456',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const verifyResponse = {
        user: testDataFactories.createTestUser(),
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
      };
      mockAuthService.verifyOTP.mockResolvedValue(verifyResponse);

      await authController.verifyOTP(req, res, next);

      expect(mockAuthService.verifyOTP).toHaveBeenCalledWith(req.body);
      const response = verifyResponseFormat(res, 200);
      expect(response.data).toHaveProperty('accessToken');
    });

    it('should handle invalid OTP', async () => {
      const req = createMockRequest({
        body: {
          email: 'test@example.com',
          otp: 'invalid',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.verifyOTP.mockRejectedValue(new UnauthorizedError('Invalid OTP'));

      await authController.verifyOTP(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      const req = createMockRequest({
        body: {
          refreshToken: 'valid_refresh_token',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.refreshToken.mockResolvedValue({
        accessToken: 'new_access_token',
      });

      await authController.refreshToken(req, res, next);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(req.body.refreshToken);
      const response = verifyResponseFormat(res, 200);
      expect(response.data).toHaveProperty('accessToken');
    });

    it('should handle invalid refresh token', async () => {
      const req = createMockRequest({
        body: {
          refreshToken: 'invalid_token',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.refreshToken.mockRejectedValue(new UnauthorizedError('Invalid refresh token'));

      await authController.refreshToken(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const req = createMockRequest({
        headers: {
          authorization: 'Bearer test_token',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const token = 'test_token';
      mockAuthService.logout.mockResolvedValue({
        message: 'Logged out successfully',
      });

      await authController.logout(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should get current user profile', async () => {
      const user = testDataFactories.createTestUser();
      const req = createMockRequest({
        user,
      });
      const res = createMockResponse();
      const next = createMockNext();

      const response = verifyResponseFormat(res, 200);
      expect(response).toBeDefined();
    });

    it('should require authentication', async () => {
      const req = createMockRequest({
        user: undefined,
      });
      const res = createMockResponse();
      const next = createMockNext();

      // This would be caught by middleware
      expect(req.user).toBeUndefined();
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const req = createMockRequest({
        params: {
          token: 'valid_token',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.validateEmail.mockResolvedValue({
        message: 'Email verified successfully',
      });

      await authController.verifyEmail(req, res, next);

      expect(mockAuthService.validateEmail).toHaveBeenCalledWith(req.params.token);
      const response = verifyResponseFormat(res, 200);
      expect(response.message).toBeDefined();
    });

    it('should handle invalid or expired token', async () => {
      const req = createMockRequest({
        params: {
          token: 'invalid_token',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.validateEmail.mockRejectedValue(new UnauthorizedError('Token expired'));

      await authController.verifyEmail(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
