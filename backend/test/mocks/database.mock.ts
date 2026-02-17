// test/mocks/database.mock.ts

import { Repository, DataSource, UpdateResult, DeleteResult } from 'typeorm';

/**
 * Mock DataSource for testing
 */
export const createMockDataSource = (): Partial<DataSource> => {
  return {
    isInitialized: true,
    getRepository: jest.fn().mockReturnValue(createMockRepository()),
  };
};

/**
 * Generic Mock Repository
 */
export const createMockRepository = <T>(): Partial<Repository<T>> => {
  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    findOneBy: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue({} as T),
    update: jest.fn().mockResolvedValue({ affected: 1 } as UpdateResult),
    delete: jest.fn().mockResolvedValue({ affected: 1 } as DeleteResult),
    createQueryBuilder: jest.fn().mockReturnValue(createMockQueryBuilder()),
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn().mockReturnValue({} as T),
  };
};

/**
 * Mock QueryBuilder for complex queries
 */
export const createMockQueryBuilder = () => {
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue(null),
    getRawMany: jest.fn().mockResolvedValue([]),
    getOne: jest.fn().mockResolvedValue(null),
    getMany: jest.fn().mockResolvedValue([]),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    getCount: jest.fn().mockResolvedValue(0),
    setParameters: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
  };
  return queryBuilder;
};

/**
 * Mock User Repository
 */
export const createMockUserRepository = (): Partial<Repository<any>> => {
  const repo = createMockRepository();
  return {
    ...repo,
    findBy: jest.fn().mockResolvedValue([]),
    findOneBy: jest.fn().mockResolvedValue(null),
  };
};

/**
 * Mock Step Repository
 */
export const createMockStepRepository = (): Partial<Repository<any>> => {
  const repo = createMockRepository();
  return {
    ...repo,
    find: jest.fn().mockResolvedValue([]),
    createQueryBuilder: jest.fn().mockReturnValue(createMockQueryBuilder()),
  };
};

/**
 * Mock Coin Repository
 */
export const createMockCoinRepository = (): Partial<Repository<any>> => {
  const repo = createMockRepository();
  return {
    ...repo,
    createQueryBuilder: jest.fn().mockReturnValue(createMockQueryBuilder()),
  };
};

/**
 * Mock Order Repository
 */
export const createMockOrderRepository = (): Partial<Repository<any>> => {
  const repo = createMockRepository();
  return {
    ...repo,
    find: jest.fn().mockResolvedValue([]),
    createQueryBuilder: jest.fn().mockReturnValue(createMockQueryBuilder()),
  };
};

/**
 * Test data factories
 */
export const testDataFactories = {
  createTestUser: (overrides = {}) => ({
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    phone: '+1234567890',
    country: 'US',
    role: 'user',
    emailVerified: true,
    isBlocked: false,
    blockedReason: null,
    blockedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createTestStep: (overrides = {}) => ({
    id: '1',
    userId: '1',
    steps: 1000,
    distance: 0.8,
    calories: 50,
    source: 'manually_entered',
    recordedAt: new Date(),
    flagged: false,
    flagReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createTestCoin: (overrides = {}) => ({
    id: '1',
    userId: '1',
    type: 'step_reward',
    amount: 100,
    description: 'Step reward',
    status: 'completed',
    createdAt: new Date(),
    ...overrides,
  }),

  createTestOrder: (overrides = {}) => ({
    id: '1',
    userId: '1',
    orderCode: 'ORD-001',
    status: 'pending',
    totalCoins: 500,
    totalPrice: 10.0,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createTestAchievement: (overrides = {}) => ({
    id: '1',
    name: 'First Step',
    description: 'Record your first step',
    icon: 'https://example.com/icon.png',
    requirement: 100,
    type: 'steps',
    reward: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
};
