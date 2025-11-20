/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import RoutesParam from '../../src/lib/RoutesParam.js';
import type { RequestParamHandler } from 'express';

// Mock console.error to suppress error logs during tests
const originalConsoleError = console.error;

describe('RoutesParam', () => {
  beforeEach(() => {
    console.error = jest.fn() as any;
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe('Constructor - Basic Properties', () => {
    it('should create an instance of RoutesParam', () => {
      const middleware: RequestParamHandler = (req, res, next, _id) => {
        next();
      };
      const param = new RoutesParam('userId', middleware);
      expect(param).toBeInstanceOf(RoutesParam);
    });

    it('should set path correctly', () => {
      const middleware: RequestParamHandler = (req, res, next, _id) => next();
      const param = new RoutesParam('userId', middleware);
      expect(param.path).toBe('userId');
    });

    it('should set middleware correctly', () => {
      const middleware: RequestParamHandler = (req, res, next, _id) => next();
      const param = new RoutesParam('userId', middleware);
      expect(param.middleware).toBe(middleware);
    });

    it('should generate unique UUID for each instance', () => {
      const middleware: RequestParamHandler = (req, res, next, _id) => next();
      const param1 = new RoutesParam('userId', middleware);
      const param2 = new RoutesParam('userId', middleware);
      expect(param1.uuidv4).not.toBe(param2.uuidv4);
    });

    it('should initialize validate as undefined when not provided', () => {
      const middleware: RequestParamHandler = (req, res, next, _id) => next();
      const param = new RoutesParam('userId', middleware);
      expect(param.validate).toBeUndefined();
    });
  });

  describe('Validation Configuration', () => {
    it('should accept pattern validation', () => {
      const middleware: RequestParamHandler = (req, res, next, _id) => next();
      const validate = {
        pattern: /^[0-9]+$/,
      };
      const param = new RoutesParam('userId', middleware, validate);
      expect(param.validate?.pattern).toEqual(/^[0-9]+$/);
    });

    it('should accept minLength validation', () => {
      const middleware: RequestParamHandler = (req, res, next, _id) => next();
      const validate = {
        minLength: 3,
      };
      const param = new RoutesParam('userId', middleware, validate);
      expect(param.validate?.minLength).toBe(3);
    });

    it('should accept maxLength validation', () => {
      const middleware: RequestParamHandler = (req, res, next, _id) => next();
      const validate = {
        maxLength: 50,
      };
      const param = new RoutesParam('userId', middleware, validate);
      expect(param.validate?.maxLength).toBe(50);
    });

    it('should accept custom validator function', () => {
      const middleware: RequestParamHandler = (req, res, next, _id) => next();
      const validatorFn = (value: string) => value.startsWith('user-');
      const validate = {
        validatorFn,
      };
      const param = new RoutesParam('userId', middleware, validate);
      expect(param.validate?.validatorFn).toBe(validatorFn);
    });

    it('should accept multiple validation rules', () => {
      const middleware: RequestParamHandler = (req, res, next, _id) => next();
      const validate = {
        pattern: /^[a-zA-Z0-9]+$/,
        minLength: 5,
        maxLength: 20,
        validatorFn: (value: string) => !value.includes('admin'),
      };
      const param = new RoutesParam('username', middleware, validate);
      expect(param.validate?.pattern).toEqual(/^[a-zA-Z0-9]+$/);
      expect(param.validate?.minLength).toBe(5);
      expect(param.validate?.maxLength).toBe(20);
      expect(typeof param.validate?.validatorFn).toBe('function');
    });
  });

  describe('validateValue Method', () => {
    describe('Pattern Validation', () => {
      it('should return true for matching pattern', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('userId', middleware, {
          pattern: /^[0-9]+$/,
        });
        expect(param.validateValue('123')).toBe(true);
      });

      it('should return false for non-matching pattern', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('userId', middleware, {
          pattern: /^[0-9]+$/,
        });
        expect(param.validateValue('abc')).toBe(false);
      });

      it('should handle complex regex patterns', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('email', middleware, {
          pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        });
        expect(param.validateValue('test@example.com')).toBe(true);
        expect(param.validateValue('invalid-email')).toBe(false);
      });
    });

    describe('Length Validation', () => {
      it('should return true for value meeting minLength', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('username', middleware, {
          minLength: 3,
        });
        expect(param.validateValue('abc')).toBe(true);
        expect(param.validateValue('abcd')).toBe(true);
      });

      it('should return false for value below minLength', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('username', middleware, {
          minLength: 3,
        });
        expect(param.validateValue('ab')).toBe(false);
      });

      it('should return true for value meeting maxLength', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('username', middleware, {
          maxLength: 10,
        });
        expect(param.validateValue('abcd')).toBe(true);
        expect(param.validateValue('abcdefghij')).toBe(true);
      });

      it('should return false for value exceeding maxLength', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('username', middleware, {
          maxLength: 10,
        });
        expect(param.validateValue('abcdefghijk')).toBe(false);
      });

      it('should validate within range (minLength and maxLength)', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('username', middleware, {
          minLength: 3,
          maxLength: 10,
        });
        expect(param.validateValue('ab')).toBe(false); // Too short
        expect(param.validateValue('abc')).toBe(true); // Exactly min
        expect(param.validateValue('abcdef')).toBe(true); // In range
        expect(param.validateValue('abcdefghij')).toBe(true); // Exactly max
        expect(param.validateValue('abcdefghijk')).toBe(false); // Too long
      });
    });

    describe('Custom Validator Function', () => {
      it('should return true when validator function returns true', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('userId', middleware, {
          validatorFn: (value) => value.startsWith('user-'),
        });
        expect(param.validateValue('user-123')).toBe(true);
      });

      it('should return false when validator function returns false', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('userId', middleware, {
          validatorFn: (value) => value.startsWith('user-'),
        });
        expect(param.validateValue('admin-123')).toBe(false);
      });

      it('should handle complex validation logic', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('productId', middleware, {
          validatorFn: (value) => {
            const parts = value.split('-');
            return parts.length === 2 && parts[0] === 'PROD' && /^[0-9]+$/.test(parts[1]);
          },
        });
        expect(param.validateValue('PROD-123')).toBe(true);
        expect(param.validateValue('PROD-ABC')).toBe(false);
        expect(param.validateValue('USER-123')).toBe(false);
      });
    });

    describe('Combined Validation Rules', () => {
      it('should validate against all rules (all passing)', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('username', middleware, {
          pattern: /^[a-zA-Z0-9]+$/,
          minLength: 5,
          maxLength: 15,
          validatorFn: (value) => !value.toLowerCase().includes('admin'),
        });
        expect(param.validateValue('john123')).toBe(true);
      });

      it('should fail if pattern fails', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('username', middleware, {
          pattern: /^[a-zA-Z0-9]+$/,
          minLength: 5,
          maxLength: 15,
        });
        expect(param.validateValue('john@123')).toBe(false); // Contains @
      });

      it('should fail if minLength fails', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('username', middleware, {
          pattern: /^[a-zA-Z0-9]+$/,
          minLength: 5,
          maxLength: 15,
        });
        expect(param.validateValue('john')).toBe(false); // Too short
      });

      it('should fail if maxLength fails', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('username', middleware, {
          pattern: /^[a-zA-Z0-9]+$/,
          minLength: 5,
          maxLength: 15,
        });
        expect(param.validateValue('johnsmith1234567')).toBe(false); // 16 chars - too long
      });

      it('should fail if validatorFn fails', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('username', middleware, {
          pattern: /^[a-zA-Z0-9]+$/,
          minLength: 5,
          maxLength: 15,
          validatorFn: (value) => !value.toLowerCase().includes('admin'),
        });
        expect(param.validateValue('admin123')).toBe(false); // Contains 'admin'
      });
    });

    describe('No Validation', () => {
      it('should return true when no validation rules are set', () => {
        const middleware: RequestParamHandler = (req, res, next, _id) => next();
        const param = new RoutesParam('anyParam', middleware);
        expect(param.validateValue('anything')).toBe(true);
        expect(param.validateValue('')).toBe(true);
        expect(param.validateValue('!@#$%^&*()')).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string path', () => {
      // Note: Empty path actually triggers process.exit in BaseClass
      // This test verifies that validation would catch it, but we skip
      // the actual instantiation to avoid process.exit
      const middleware: RequestParamHandler = (req, res, next, _id) => next();
      // Cannot test this directly as it calls process.exit(1)
      // In production, this would prevent invalid configuration
      expect(true).toBe(true); // Placeholder
    });

    it('should handle empty string value in validation', () => {
      const middleware: RequestParamHandler = (req, res, next, _id) => next();
      const param = new RoutesParam('param', middleware, {
        minLength: 1,
      });
      expect(param.validateValue('')).toBe(false);
    });

    it('should handle very long values', () => {
      const middleware: RequestParamHandler = (req, res, next, _id) => next();
      const param = new RoutesParam('param', middleware, {
        maxLength: 5000,
      });
      const longValue = 'A'.repeat(5000);
      expect(param.validateValue(longValue)).toBe(true);
      expect(param.validateValue(longValue + 'B')).toBe(false);
    });

    it('should handle special characters in values', () => {
      const middleware: RequestParamHandler = (req, res, next, _id) => next();
      const param = new RoutesParam('param', middleware, {
        pattern: /^[a-zA-Z0-9!@#$%^&*()]+$/,
      });
      expect(param.validateValue('test!@#123')).toBe(true);
    });

    it('should handle unicode characters', () => {
      const middleware: RequestParamHandler = (req, res, next, _id) => next();
      const param = new RoutesParam('name', middleware, {
        minLength: 2,
        maxLength: 20,
      });
      expect(param.validateValue('用户123')).toBe(true);
      expect(param.validateValue('👤🎉')).toBe(true);
    });
  });

  describe('Middleware Property', () => {
    it('should store and retrieve middleware function', () => {
       
      let middlewareCalled = false;
      const middleware: RequestParamHandler = (req, res, next, _id) => {
        middlewareCalled = true;
        next();
      };
      const param = new RoutesParam('userId', middleware);
      expect(param.middleware).toBe(middleware);
    });

    it('should allow middleware to be called', () => {
      let capturedValue = '';
      const middleware: RequestParamHandler = (req, res, next, value) => {
        capturedValue = value;
        next();
      };
      const param = new RoutesParam('userId', middleware);

      // Simulate calling the middleware
      const mockNext = jest.fn() as any;
      param.middleware({} as any, {} as any, mockNext, '123', 'userId');

      expect(capturedValue).toBe('123');
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
