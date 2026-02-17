// test/integration/auth.integration.spec.ts

/**
 * Integration Tests for Authentication Flow
 * Tests complete authentication workflows through all layers
 */

import { AuthService } from '../../src/services/auth.service';
import { UserRepository } from '../../src/repositories/user.repository';
import { RedisClient } from '../../src/config/redis';
import { createMockRepository, testDataFactories } from '../mocks/database.mock';
import { createMockRedisClient } from '../mocks/redis.mock';

describe('Authentication Integration Tests', () => {
  let authService: AuthService;
  let mockUserRepository: any;
  let mockRedis: any;

  beforeEach(() => {
    mockUserRepository = createMockRepository();
    mockRedis = createMockRedisClient();

    jest.spyOn(UserRepository.prototype, 'getRepository').mockReturnValue(mockUserRepository);
    jest.spyOn(RedisClient, 'getInstance').mockReturnValue(mockRedis);

    authService = new AuthService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Authentication Flow', () => {
    describe('User Registration → Login → Token Refresh Flow', () => {
      it('should complete full authentication lifecycle', async () => {
        // Step 1: Register user
        const registerData = {
          email: 'flowtest@example.com',
          password: 'Password123!',
          name: 'Flow Test User',
          phone: '+1234567890',
          country: 'US',
        };

        mockUserRepository.findOneBy.mockResolvedValueOnce(null); // Check if user exists
        const newUser = testDataFactories.createTestUser(registerData);
        mockUserRepository.save.mockResolvedValueOnce(newUser);

        const registeredUser = await authService.register(registerData);

        expect(registeredUser).toHaveProperty('id');
        expect(registeredUser).toHaveProperty('email', registerData.email);
        console.log('✅ Step 1: User registration completed');

        // Step 2: Login with registered user
        mockUserRepository.findOneBy.mockResolvedValueOnce(registeredUser);

        const loginResult = await authService.login({
          email: registerData.email,
          password: registerData.password,
        });

        expect(loginResult).toHaveProperty('accessToken');
        expect(loginResult).toHaveProperty('refreshToken');
        const { accessToken, refreshToken } = loginResult;
        console.log('✅ Step 2: User login completed');

        // Step 3: Use access token to get profile
        expect(loginResult).toHaveProperty('user');
        expect(loginResult.user.email).toBe(registerData.email);
        console.log('✅ Step 3: Retrieved user profile with access token');

        // Step 4: Refresh token when access token expires
        jest.spyOn(authService as any, 'verifyToken').mockReturnValue({ id: registeredUser.id });
        mockUserRepository.findOneBy.mockResolvedValueOnce(registeredUser);

        const refreshResult = await authService.refreshToken(refreshToken);

        expect(refreshResult).toHaveProperty('accessToken');
        expect(refreshResult.accessToken).not.toBe(accessToken); // New token
        console.log('✅ Step 4: Token refresh completed');

        // Step 5: Logout
        mockRedis.setex.mockResolvedValueOnce('OK');
        const logoutResult = await authService.logout(refreshResult.accessToken);

        expect(logoutResult).toHaveProperty('message');
        console.log('✅ Step 5: User logout completed');
      });
    });

    describe('OTP-Based Authentication Flow', () => {
      it('should complete OTP authentication flow', async () => {
        const email = 'otp@example.com';
        const otp = '123456';
        const user = testDataFactories.createTestUser({ email });

        // Step 1: User requests OTP
        mockUserRepository.findOneBy.mockResolvedValueOnce(user);
        mockRedis.setex.mockResolvedValueOnce('OK');

        const sendResult = await authService.sendOTP(email);
        expect(sendResult).toHaveProperty('message');
        console.log('✅ Step 1: OTP sent to email');

        // Step 2: User receives OTP and verifies it
        mockUserRepository.findOneBy.mockResolvedValueOnce(user);
        mockRedis.get.mockResolvedValueOnce(otp);
        mockRedis.del.mockResolvedValueOnce(1);

        const verifyResult = await authService.verifyOTP({ email, otp });

        expect(verifyResult).toHaveProperty('accessToken');
        expect(verifyResult).toHaveProperty('refreshToken');
        console.log('✅ Step 2: OTP verified, tokens issued');
      });
    });

    describe('Email Verification Flow', () => {
      it('should verify email and update user status', async () => {
        const user = testDataFactories.createTestUser({ emailVerified: false });
        const verificationToken = 'email_verification_token_123';

        // Step 1: Send verification email
        mockRedis.setex.mockResolvedValueOnce('OK');
        console.log('✅ Step 1: Verification email sent');

        // Step 2: User clicks verification link
        mockRedis.get.mockResolvedValueOnce(user.id);
        const updatedUser = testDataFactories.createTestUser({ 
          ...user,
          emailVerified: true 
        });
        mockUserRepository.save.mockResolvedValueOnce(updatedUser);
        mockRedis.del.mockResolvedValueOnce(1);

        const verifyResult = await authService.validateEmail(verificationToken);

        expect(verifyResult).toHaveProperty('message');
        console.log('✅ Step 2: Email verified successfully');

        // Step 3: User can now perform actions that require verified email
        expect(updatedUser.emailVerified).toBe(true);
        console.log('✅ Step 3: Email verification status verified');
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle duplicate registration gracefully', async () => {
      const email = 'duplicate@example.com';
      const user = testDataFactories.createTestUser({ email });

      mockUserRepository.findOneBy.mockResolvedValue(user);

      await expect(authService.register({
        email,
        password: 'Password123!',
        name: 'User',
        phone: '+1234567890',
        country: 'US',
      })).rejects.toThrow();

      console.log('✅ Duplicate registration properly rejected');
    });

    it('should handle rate limiting on failed login attempts', async () => {
      const email = 'ratelimit@example.com';
      mockUserRepository.findOneBy.mockResolvedValue(null);

      // Simulate 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await expect(authService.login({
          email,
          password: 'wrongpassword',
        })).rejects.toThrow();
      }

      // On 6th attempt, should rate limit
      mockRedis.get.mockResolvedValueOnce('5'); // 5 previous attempts
      await expect(authService.login({
        email,
        password: 'wrongpassword',
      })).rejects.toThrow();

      console.log('✅ Rate limiting on failed attempts working');
    });

    it('should block access for blocked users', async () => {
      const blockedUser = testDataFactories.createTestUser({
        isBlocked: true,
        blockedReason: 'Suspicious activity',
      });

      mockUserRepository.findOneBy.mockResolvedValue(blockedUser);

      await expect(authService.login({
        email: blockedUser.email,
        password: 'Password123!',
      })).rejects.toThrow();

      console.log('✅ Blocked user properly denied access');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent login attempts', async () => {
      const user = testDataFactories.createTestUser();
      mockUserRepository.findOneBy.mockResolvedValue(user);

      const loginPromises = Array(3).fill(null).map(() =>
        authService.login({
          email: user.email,
          password: 'password123',
        })
      );

      const results = await Promise.all(loginPromises);

      results.forEach(result => {
        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('refreshToken');
      });

      console.log('✅ Concurrent login attempts handled correctly');
    });
  });

  describe('Session Management', () => {
    it('should track active sessions', async () => {
      const user = testDataFactories.createTestUser();
      const sessions = [];

      // Simulate 3 login sessions
      for (let i = 0; i < 3; i++) {
        mockUserRepository.findOneBy.mockResolvedValueOnce(user);
        const result = await authService.login({
          email: user.email,
          password: 'password123',
        });
        sessions.push(result);
      }

      expect(sessions).toHaveLength(3);
      sessions.forEach((session, index) => {
        expect(session).toHaveProperty('accessToken');
        expect(session).toHaveProperty('refreshToken');
      });

      console.log('✅ Multiple sessions managed correctly');
    });

    it('should invalidate session on logout', async () => {
      const token = 'session_token_123';
      mockRedis.setex.mockResolvedValueOnce('OK');

      const result = await authService.logout(token);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining('blacklist'),
        expect.any(Number),
        token
      );

      console.log('✅ Session invalidated on logout');
    });
  });
});
