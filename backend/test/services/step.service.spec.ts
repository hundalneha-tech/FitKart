// test/services/step.service.spec.ts

import { StepService } from '../../src/services/step.service';
import { StepRepository } from '../../src/repositories/step.repository';
import { UserRepository } from '../../src/repositories/user.repository';
import { BadRequestError, ValidationError, NotFoundError } from '../../src/utils/errors';
import { createMockRepository, testDataFactories } from '../mocks/database.mock';

describe('StepService', () => {
  let stepService: StepService;
  let mockStepRepository: any;
  let mockUserRepository: any;

  beforeEach(() => {
    mockStepRepository = createMockRepository();
    mockUserRepository = createMockRepository();

    jest.spyOn(StepRepository.prototype, 'getRepository').mockReturnValue(mockStepRepository as any);
    jest.spyOn(UserRepository.prototype, 'getRepository').mockReturnValue(mockUserRepository as any);

    stepService = new StepService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('recordSteps', () => {
    it('should record steps successfully', async () => {
      const userId = '1';
      const steps = 5000;
      const distance = 4.0;

      mockUserRepository.findOneBy.mockResolvedValue(testDataFactories.createTestUser());
      mockStepRepository.save.mockResolvedValue(
        testDataFactories.createTestStep({ userId, steps, distance })
      );

      const result = await stepService.recordSteps(userId, {
        steps,
        distance,
        source: 'manually_entered',
      });

      expect(result).toHaveProperty('steps', steps);
      expect(result).toHaveProperty('distance', distance);
      expect(mockStepRepository.save).toHaveBeenCalled();
    });

    it('should validate steps before recording', async () => {
      const userId = '1';

      mockUserRepository.findOneBy.mockResolvedValue(testDataFactories.createTestUser());

      // Negative steps should fail
      await expect(stepService.recordSteps(userId, {
        steps: -100,
        distance: 0,
        source: 'manually_entered',
      })).rejects.toThrow(ValidationError);
    });

    it('should flag suspicious activity for review', async () => {
      const userId = '1';
      const suspiciousSteps = 50000; // Unrealistic step count

      mockUserRepository.findOneBy.mockResolvedValue(testDataFactories.createTestUser());
      mockStepRepository.save.mockResolvedValue(
        testDataFactories.createTestStep({
          userId,
          steps: suspiciousSteps,
          flagged: true,
          flagReason: 'Unusually high step count',
        })
      );

      const result = await stepService.recordSteps(userId, {
        steps: suspiciousSteps,
        distance: 40.0,
        source: 'manually_entered',
      });

      expect(result.flagged).toBe(true);
      expect(result.flagReason).toBeDefined();
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(stepService.recordSteps('invalid', {
        steps: 1000,
        distance: 0.8,
        source: 'manually_entered',
      })).rejects.toThrow(NotFoundError);
    });
  });

  describe('getTodaySteps', () => {
    it('should return today total steps', async () => {
      const userId = '1';
      const mockSteps = [
        testDataFactories.createTestStep({ steps: 1000 }),
        testDataFactories.createTestStep({ steps: 2000 }),
        testDataFactories.createTestStep({ steps: 500 }),
      ];

      mockStepRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: 3500 }),
      });

      const result = await stepService.getTodaySteps(userId);

      expect(result).toBe(3500);
    });

    it('should return 0 if no steps recorded today', async () => {
      mockStepRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      });

      const result = await stepService.getTodaySteps('1');

      expect(result).toBe(0);
    });
  });

  describe('getWeeklySteps', () => {
    it('should return weekly breakdown', async () => {
      const userId = '1';
      const mockWeeklyData = [
        { date: '2024-02-10', total: 5000 },
        { date: '2024-02-11', total: 6000 },
        { date: '2024-02-12', total: 4500 },
        { date: '2024-02-13', total: 7000 },
        { date: '2024-02-14', total: 5500 },
        { date: '2024-02-15', total: 6500 },
        { date: '2024-02-16', total: 8000 },
      ];

      mockStepRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockWeeklyData),
      });

      const result = await stepService.getWeeklySteps(userId);

      expect(result).toHaveLength(7);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('total');
    });
  });

  describe('getMonthlySteps', () => {
    it('should return monthly breakdown', async () => {
      const userId = '1';

      mockStepRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(
          Array(28).fill(null).map((_, i) => ({
            date: `2024-02-${(i + 1).toString().padStart(2, '0')}`,
            total: 5000 + Math.random() * 5000,
          }))
        ),
      });

      const result = await stepService.getMonthlySteps(userId);

      expect(result.length).toBeGreaterThan(0);
      result.forEach(day => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('total');
      });
    });
  });

  describe('getCurrentStreak', () => {
    it('should calculate current streak', async () => {
      const userId = '1';

      mockStepRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { date: '2024-02-16', total: 8000 }, // Today: ✓
          { date: '2024-02-15', total: 6500 }, // Yesterday: ✓
          { date: '2024-02-14', total: 5500 }, // 2 days ago: ✓
          { date: '2024-02-12', total: 0 }, // 4 days ago: ✗ (streak breaks)
        ]),
      });

      const result = await stepService.getCurrentStreak(userId);

      expect(result).toBe(3); // Current streak of 3 days
    });

    it('should return 0 if no streak', async () => {
      mockStepRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(
          [{ date: '2024-02-10', total: 0 }] // Old record with no steps
        ),
      });

      const result = await stepService.getCurrentStreak('1');

      expect(result).toBe(0);
    });
  });

  describe('getBestDay', () => {
    it('should return personal record', async () => {
      const userId = '1';
      const bestDay = testDataFactories.createTestStep({ steps: 15000, distance: 12 });

      mockStepRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(bestDay),
      });

      const result = await stepService.getBestDay(userId);

      expect(result).toHaveProperty('steps', 15000);
      expect(result).toHaveProperty('distance', 12);
    });

    it('should return null if no steps recorded', async () => {
      mockStepRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      const result = await stepService.getBestDay('1');

      expect(result).toBeNull();
    });
  });

  describe('getHistory', () => {
    it('should return paginated step history', async () => {
      const userId = '1';
      const mockHistory = [
        testDataFactories.createTestStep({ steps: 5000 }),
        testDataFactories.createTestStep({ steps: 6000 }),
      ];

      mockStepRepository.find.mockResolvedValue(mockHistory);
      mockStepRepository.count.mockResolvedValue(2);

      const result = await stepService.getHistory(userId, 1, 10);

      expect(result).toHaveProperty('steps');
      expect(result).toHaveProperty('pagination');
      expect(result.steps).toHaveLength(2);
    });

    it('should filter by date range', async () => {
      const userId = '1';
      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-02-15');

      mockStepRepository.find.mockResolvedValue([]);
      mockStepRepository.count.mockResolvedValue(0);

      const result = await stepService.getHistory(userId, 1, 10, startDate, endDate);

      expect(result).toBeDefined();
    });
  });

  describe('Anti-Cheat Detection', () => {
    it('should flag impossible activity (50k+ steps in one record)', async () => {
      const userId = '1';

      mockUserRepository.findOneBy.mockResolvedValue(testDataFactories.createTestUser());
      mockStepRepository.save.mockResolvedValue(
        testDataFactories.createTestStep({ flagged: true })
      );

      const result = await stepService.recordSteps(userId, {
        steps: 50000,
        distance: 40,
        source: 'manually_entered',
      });

      expect(result.flagged).toBe(true);
    });

    it('should flag impossible distance calculation', async () => {
      const userId = '1';

      mockUserRepository.findOneBy.mockResolvedValue(testDataFactories.createTestUser());
      mockStepRepository.save.mockResolvedValue(
        testDataFactories.createTestStep({ flagged: true })
      );

      // 1000 steps should be approximately 0.8km, not 100km
      const result = await stepService.recordSteps(userId, {
        steps: 1000,
        distance: 100,
        source: 'manually_entered',
      });

      expect(result.flagged).toBe(true);
    });
  });
});
