// test/services/coin.service.spec.ts

import { CoinService } from '../../src/services/coin.service';
import { CoinRepository } from '../../src/repositories/coin.repository';
import { UserRepository } from '../../src/repositories/user.repository';
import { BadRequestError, ValidationError, NotFoundError } from '../../src/utils/errors';
import { createMockRepository, testDataFactories } from '../mocks/database.mock';

describe('CoinService', () => {
  let coinService: CoinService;
  let mockCoinRepository: any;
  let mockUserRepository: any;

  beforeEach(() => {
    mockCoinRepository = createMockRepository();
    mockUserRepository = createMockRepository();

    jest.spyOn(CoinRepository.prototype, 'getRepository').mockReturnValue(mockCoinRepository as any);
    jest.spyOn(UserRepository.prototype, 'getRepository').mockReturnValue(mockUserRepository as any);

    coinService = new CoinService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return user coin balance', async () => {
      const userId = '1';
      const user = testDataFactories.createTestUser();

      mockUserRepository.findOneBy.mockResolvedValue(user);
      mockCoinRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { type: 'step_reward', earned: 1000 },
          { type: 'store_purchase', spent: 500 },
        ]),
        getMany: jest.fn().mockResolvedValue([]),
      });

      const result = await coinService.getBalance(userId);

      expect(result).toHaveProperty('userId', userId);
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('available');
      expect(result).toHaveProperty('frozen');
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(coinService.getBalance('invalid')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getHistory', () => {
    it('should return paginated coin transactions', async () => {
      const userId = '1';
      const page = 1;
      const limit = 10;
      const mockTransactions = [
        testDataFactories.createTestCoin({ type: 'step_reward' }),
        testDataFactories.createTestCoin({ type: 'store_purchase' }),
      ];

      mockCoinRepository.find.mockResolvedValue(mockTransactions);
      mockCoinRepository.count.mockResolvedValue(2);

      const result = await coinService.getHistory(userId, page, limit);

      expect(result).toHaveProperty('transactions');
      expect(result).toHaveProperty('pagination');
      expect(result.transactions).toHaveLength(2);
    });

    it('should filter by type if provided', async () => {
      const userId = '1';
      mockCoinRepository.find.mockResolvedValue([testDataFactories.createTestCoin()]);
      mockCoinRepository.count.mockResolvedValue(1);

      const result = await coinService.getHistory(userId, 1, 10, 'step_reward');

      expect(result.transactions).toBeDefined();
    });
  });

  describe('checkBalance', () => {
    it('should return true if user has sufficient balance', async () => {
      const userId = '1';
      const requiredAmount = 100;

      mockCoinRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ available: 500 }),
      });

      const result = await coinService.checkBalance(userId, requiredAmount);

      expect(result).toEqual(true);
    });

    it('should return false if user has insufficient balance', async () => {
      const userId = '1';
      const requiredAmount = 1000;

      mockCoinRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ available: 500 }),
      });

      const result = await coinService.checkBalance(userId, requiredAmount);

      expect(result).toEqual(false);
    });
  });

  describe('spendCoins', () => {
    it('should successfully spend coins for valid transaction', async () => {
      const userId = '1';
      const spendData = {
        amount: 100,
        type: 'store_purchase',
        description: 'Bought product',
      };

      mockCoinRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ available: 500 }),
      });
      mockCoinRepository.save.mockResolvedValue(testDataFactories.createTestCoin());

      const result = await coinService.spendCoins(userId, spendData);

      expect(result).toHaveProperty('id');
      expect(mockCoinRepository.save).toHaveBeenCalled();
    });

    it('should throw error if insufficient balance', async () => {
      const userId = '1';
      const spendData = {
        amount: 1000,
        type: 'store_purchase',
        description: 'Bought product',
      };

      mockCoinRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ available: 500 }),
      });

      await expect(coinService.spendCoins(userId, spendData)).rejects.toThrow(BadRequestError);
    });
  });

  describe('freezeCoins', () => {
    it('should freeze coins for order', async () => {
      const userId = '1';
      const amount = 200;
      const orderId = '123';

      mockCoinRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ available: 500 }),
      });
      mockCoinRepository.save.mockResolvedValue({
        ...testDataFactories.createTestCoin(),
        status: 'frozen',
        amount,
      });

      const result = await coinService.freezeCoins(userId, amount, orderId);

      expect(result).toHaveProperty('status', 'frozen');
      expect(mockCoinRepository.save).toHaveBeenCalled();
    });

    it('should throw error if insufficient balance to freeze', async () => {
      const userId = '1';
      mockCoinRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ available: 50 }),
      });

      await expect(coinService.freezeCoins(userId, 200, '123')).rejects.toThrow(BadRequestError);
    });
  });

  describe('unfreezeCoins', () => {
    it('should unfreeze frozen coins', async () => {
      const userId = '1';
      const amount = 200;
      const orderId = '123';

      mockCoinRepository.find.mockResolvedValue([
        {
          ...testDataFactories.createTestCoin(),
          status: 'frozen',
          amount,
        },
      ]);
      mockCoinRepository.save.mockResolvedValue({
        ...testDataFactories.createTestCoin(),
        status: 'completed',
      });

      const result = await coinService.unfreezeCoins(userId, orderId);

      expect(result).toBeDefined();
      expect(mockCoinRepository.save).toHaveBeenCalled();
    });
  });

  describe('addCoins', () => {
    it('should add coins to user account (admin only)', async () => {
      const userId = '1';
      const addData = {
        amount: 500,
        reason: 'Customer service compensation',
      };

      mockUserRepository.findOneBy.mockResolvedValue(testDataFactories.createTestUser());
      mockCoinRepository.save.mockResolvedValue({
        ...testDataFactories.createTestCoin(),
        amount: addData.amount,
        type: 'admin_added',
      });

      const result = await coinService.addCoins(userId, addData.amount, addData.reason);

      expect(result).toHaveProperty('amount', addData.amount);
      expect(mockCoinRepository.save).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return coin statistics for user', async () => {
      const userId = '1';

      mockCoinRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { type: 'step_reward', total: 1000 },
          { type: 'store_purchase', total: 500 },
        ]),
      });

      const result = await coinService.getStats(userId);

      expect(result).toHaveProperty('earned');
      expect(result).toHaveProperty('spent');
      expect(result).toHaveProperty('net');
    });
  });
});
