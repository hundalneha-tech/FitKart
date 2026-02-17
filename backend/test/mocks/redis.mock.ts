// test/mocks/redis.mock.ts

/**
 * Mock Redis Client for testing
 */
export const createMockRedisClient = () => {
  const storage = new Map<string, string>();

  return {
    set: jest.fn(async (key: string, value: string) => 'OK'),
    get: jest.fn(async (key: string) => storage.get(key) || null),
    del: jest.fn(async (key: string) => (storage.has(key) ? 1 : 0)),
    exists: jest.fn(async (key: string) => (storage.has(key) ? 1 : 0)),
    incr: jest.fn(async (key: string) => {
      const current = parseInt(storage.get(key) || '0', 10);
      const newValue = current + 1;
      storage.set(key, newValue.toString());
      return newValue;
    }),
    decr: jest.fn(async (key: string) => {
      const current = parseInt(storage.get(key) || '0', 10);
      const newValue = current - 1;
      storage.set(key, newValue.toString());
      return newValue;
    }),
    expire: jest.fn(async () => 1),
    ttl: jest.fn(async () => 3600),
    setex: jest.fn(async (key: string, seconds: number, value: string) => 'OK'),
    getex: jest.fn(async (key: string) => storage.get(key) || null),
    hset: jest.fn(async (key: string, field: string, value: string) => 1),
    hget: jest.fn(async (key: string, field: string) => null),
    hgetall: jest.fn(async (key: string) => ({})),
    hmset: jest.fn(async () => 'OK'),
    hmget: jest.fn(async () => []),
    hdel: jest.fn(async () => 0),
    hexists: jest.fn(async () => false),
    llen: jest.fn(async () => 0),
    lpush: jest.fn(async () => 0),
    rpush: jest.fn(async () => 0),
    lpop: jest.fn(async () => null),
    rpop: jest.fn(async () => null),
    lrange: jest.fn(async () => []),
    zadd: jest.fn(async () => 0),
    zcard: jest.fn(async () => 0),
    zrange: jest.fn(async () => []),
    zrem: jest.fn(async () => 0),
    zcount: jest.fn(async () => 0),
    zrevrange: jest.fn(async () => []),
    zrevrangebyscore: jest.fn(async () => []),
    zrank: jest.fn(async () => null),
    zscore: jest.fn(async () => null),
    ping: jest.fn(async () => 'PONG'),
    flushdb: jest.fn(async () => 'OK'),
    flushall: jest.fn(async () => 'OK'),
    keys: jest.fn(async () => Array.from(storage.keys())),
    clear: () => storage.clear(),
    getStorage: () => storage,
  };
};

/**
 * Mock RateLimiter for testing
 */
export const createMockRateLimiter = () => {
  return {
    checkLimit: jest.fn(async () => ({ allowed: true, remaining: 100, resetTime: Date.now() + 3600000 })),
    increment: jest.fn(async () => ({ count: 1, resetTime: Date.now() + 3600000 })),
    reset: jest.fn(async () => true),
    getLimit: jest.fn(async () => ({ limit: 100, window: 3600 })),
  };
};
