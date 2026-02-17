// test/utils/testHelpers.ts

import { AppError, ValidationError, BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from '../../src/utils/errors';

/**
 * Helper to create mock Express Request
 */
export const createMockRequest = (overrides = {}) => ({
  user: { id: '1', role: 'user', email: 'test@example.com' },
  body: {},
  params: {},
  query: {},
  headers: {},
  ip: '127.0.0.1',
  method: 'GET',
  url: '/',
  ...overrides,
});

/**
 * Helper to create mock Express Response
 */
export const createMockResponse = () => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    headersSent: false,
    statusCode: 200,
    locals: {},
  };
  return res;
};

/**
 * Helper to create mock Express Next function
 */
export const createMockNext = () => jest.fn();

/**
 * Helper to verify response format
 */
export const verifyResponseFormat = (response: any, expectedStatus: number) => {
  expect(response.status).toHaveBeenCalledWith(expectedStatus);
  expect(response.json).toHaveBeenCalled();
  const data = response.json.mock.calls[0][0];
  expect(data).toHaveProperty('status');
  expect(data).toHaveProperty('timestamp');
  return data;
};

/**
 * Helper to verify error response
 */
export const verifyErrorResponse = (response: any, expectedStatusCode: number, expectedMessage?: string) => {
  const data = verifyResponseFormat(response, expectedStatusCode);
  expect(data).toHaveProperty('error');
  if (expectedMessage) {
    expect(data.error.message).toContain(expectedMessage);
  }
  return data;
};

/**
 * Helper to generate JWT token for testing
 */
export const generateTestToken = (payload: any = {}) => {
  // This is a simplified token - in real tests you'd use jsonwebtoken
  const defaultPayload = {
    id: '1',
    email: 'test@example.com',
    role: 'user',
    ...payload,
  };
  return `test_token_${Buffer.from(JSON.stringify(defaultPayload)).toString('base64')}`;
};

/**
 * Helper to wait for async operations
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper to expect error
 */
export const expectError = (fn: () => any, errorClass: any, message?: string) => {
  expect(fn).toThrow(errorClass);
  if (message) {
    expect(fn).toThrow(message);
  }
};

/**
 * Helper to test service method
 */
export const testServiceMethod = async (
  method: () => Promise<any>,
  expectedResult?: any,
  expectedError?: any,
) => {
  if (expectedError) {
    await expect(method()).rejects.toThrow(expectedError);
  } else {
    const result = await method();
    if (expectedResult !== undefined) {
      expect(result).toEqual(expectedResult);
    }
    return result;
  }
};

/**
 * Test data validators
 */
export const testValidators = {
  isValidUUID: (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id),
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isValidPassword: (password: string) => password.length >= 6,
};

/**
 * Mock logger for testing
 */
export const createMockLogger = () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
});

/**
 * Helper to compare objects (ignoring dates)
 */
export const compareObjects = (obj1: any, obj2: any) => {
  const stringify = (obj: any) =>
    JSON.stringify(obj, (key, value) => {
      if (value instanceof Date) return value.toISOString();
      return value;
    });
  return stringify(obj1) === stringify(obj2);
};
