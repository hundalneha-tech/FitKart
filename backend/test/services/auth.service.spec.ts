// test/services/auth.service.spec.ts

import { AuthService } from '../../src/services/auth.service';
import { UserRepository } from '../../src/repositories/user.repository';
import { RedisClient } from '../../src/config/redis';
import { BadRequestError, ValidationError, NotFoundError, UnauthorizedError } from '../../src/utils/errors';
import { createMockRepository, testDataFactories } from '../mocks/database.mock';
import { createMockRedisClient } from '../mocks/redis.mock';
import * as crypto from 'crypto';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: any;
  let mockRedis: any;

  beforeEach(() => {
    // Create mocks
    mockUserRepository = createMockRepository();
    mockRedis = createMockRedisClient();

    // Mock dependencies
    jest.spyOn(UserRepository.prototype, 'getRepository').mockReturnValue(mockUserRepository as any);
    jest.spyOn(RedisClient, 'getInstance').mockReturnValue(mockRedis as any);

    // Initialize service
    authService = new AuthService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'Password123!',
        name: 'New User',
        phone: '+1234567890',
        country: 'US',
      };

      mockUserRepository.findOneBy.mockResolvedValue(null);
      const newUser = testDataFactories.createTestUser({ ...registerData, password: 'hashedPassword' });
      mockUserRepository.save.mockResolvedValue(newUser);

      const result = await authService.register(registerData);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: registerData.email });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', registerData.email);
    });

    it('should throw error if email already exists', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'Password123!',
        name: 'User',
        phone: '+1234567890',
        country: 'US',
      };

      const existingUser = testDataFactories.createTestUser({ email: registerData.email });
      mockUserRepository.findOneBy.mockResolvedValue(existingUser);

      await expect(authService.register(registerData)).rejects.toThrow(BadRequestError);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        email: 'invalid',
        password: 'short',
        name: '',
        phone: '',
        country: 'US',
      };

      await expect(authService.register(invalidData)).rejects.toThrow(ValidationError);
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = testDataFactories.createTestUser({ email: loginData.email });
      mockUserRepository.findOneBy.mockResolvedValue(user);

      const result = await authService.login(loginData);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: loginData.email });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('should throw error if user not found', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw error if user is blocked', async () => {
      const loginData = {
        email: 'blocked@example.com',
        password: 'password123',
      };

      const blockedUser = testDataFactories.createTestUser({
        email: loginData.email,
        isBlocked: true,
        blockedReason: 'Suspicious activity',
      });
      mockUserRepository.findOneBy.mockResolvedValue(blockedUser);

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('sendOTP', () => {
    it('should generate and send OTP to email', async () => {
      const email = 'test@example.com';
      const user = testDataFactories.createTestUser({ email });
      mockUserRepository.findOneBy.mockResolvedValue(user);
      mockRedis.setex.mockResolvedValue('OK');

      const result = await authService.sendOTP(email);

      expect(mockUserRepository.findOneBy).toHaveBeenCalled();
      expect(mockRedis.setex).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(authService.sendOTP('nonexistent@example.com')).rejects.toThrow(NotFoundError);
    });
  });

  describe('verifyOTP', () => {
    it('should verify correct OTP and return tokens', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const user = testDataFactories.createTestUser({ email });

      mockUserRepository.findOneBy.mockResolvedValue(user);
      mockRedis.get.mockResolvedValue(otp);
      mockRedis.del.mockResolvedValue(1);

      const result = await authService.verifyOTP({ email, otp });

      expect(mockRedis.get).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error if OTP is invalid', async () => {
      const email = 'test@example.com';
      mockUserRepository.findOneBy.mockResolvedValue(testDataFactories.createTestUser());
      mockRedis.get.mockResolvedValue('654321');

      await expect(authService.verifyOTP({ email, otp: '123456' })).rejects.toThrow(UnauthorizedError);
    });

    it('should throw error if OTP is expired', async () => {
      const email = 'test@example.com';
      mockUserRepository.findOneBy.mockResolvedValue(testDataFactories.createTestUser());
      mockRedis.get.mockResolvedValue(null);

      await expect(authService.verifyOTP({ email, otp: '123456' })).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('refreshToken', () => {
    it('should generate new access token from valid refresh token', async () => {
      const refreshToken = 'valid_refresh_token';
      const user = testDataFactories.createTestUser();

      // Mock JWT verification (in real scenario, this would decode the token)
      jest.spyOn(authService as any, 'verifyToken').mockReturnValue({ id: user.id });
      mockUserRepository.findOneBy.mockResolvedValue(user);

      const result = await authService.refreshToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
    });

    it('should throw error if refresh token is invalid', async () => {
      const invalidToken = 'invalid_token';

      jest.spyOn(authService as any, 'verifyToken').mockImplementation(() => {
        throw new UnauthorizedError('Invalid token');
      });

      await expect(authService.refreshToken(invalidToken)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('logout', () => {
    it('should add token to blacklist', async () => {
      const token = 'test_token';
      mockRedis.setex.mockResolvedValue('OK');

      const result = await authService.logout(token);

      expect(mockRedis.setex).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
    });
  });

  describe('validateEmail', () => {
    it('should verify email with valid token', async () => {
      const userId = '1';
      const token = 'test_token';
      const user = testDataFactories.createTestUser({ emailVerified: false });

      mockRedis.get.mockResolvedValue(userId);
      mockUserRepository.save.mockResolvedValue({ ...user, emailVerified: true });

      const result = await authService.validateEmail(token);

      expect(mockRedis.get).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
    });

    it('should throw error if token is invalid or expired', async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(authService.validateEmail('invalid_token')).rejects.toThrow(UnauthorizedError);
    });
  });
});
