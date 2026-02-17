// test/setup.ts

import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_HOST = process.env.DATABASE_HOST || 'localhost';
  process.env.DATABASE_PORT = process.env.DATABASE_PORT || '5432';
  process.env.DATABASE_NAME = process.env.DATABASE_NAME || 'fitkart_test';
  process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
  process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_12345';
  
  console.log('🧪 Test environment initialized');
});

// Global teardown
afterAll(() => {
  console.log('✅ Test suite completed');
});

// Global error handling
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
