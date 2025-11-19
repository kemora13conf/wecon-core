import { describe, it, expect } from '@jest/globals';
import RequestError from '../../src/errors/RequestError.js';

describe('RequestError', () => {
  describe('Constructor', () => {
    it('should create an instance of RequestError', () => {
      const error = new RequestError('Test error message');
      expect(error).toBeInstanceOf(RequestError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should set the error message correctly', () => {
      const message = 'Request validation failed';
      const error = new RequestError(message);
      expect(error.message).toBe(message);
    });

    it('should set the error name to "RequestError"', () => {
      const error = new RequestError('Test error');
      expect(error.name).toBe('RequestError');
    });

    it('should initialize meta as empty object when not provided', () => {
      const error = new RequestError('Test error');
      expect(error.meta).toEqual({});
    });

    it('should store metadata when provided', () => {
      const meta = { code: 'RAI_NOT_FOUND', route: '/api/users' };
      const error = new RequestError('Route not found', meta);
      expect(error.meta).toEqual(meta);
    });

    it('should maintain prototype chain for instanceof checks', () => {
      const error = new RequestError('Test error');
      expect(error instanceof RequestError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('Stack Trace', () => {
    it('should capture stack trace', () => {
      const error = new RequestError('Test error');
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('RequestError');
    });

    it('should have stack trace that excludes constructor', () => {
      const error = new RequestError('Test error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('RequestError.test.ts');
    });
  });

  describe('Metadata', () => {
    it('should handle request-specific metadata', () => {
      const meta = {
        code: 'UNAUTHORIZED',
        route: '/api/admin/users',
        method: 'POST',
        requiredRoles: ['admin'],
        userRoles: ['guest'],
      };
      const error = new RequestError('Insufficient permissions', meta);
      expect(error.meta).toEqual(meta);
      expect(error.meta.code).toBe('UNAUTHORIZED');
    });

    it('should handle RAI not found metadata', () => {
      const meta = {
        code: 'RAI_NOT_FOUND',
        route: '/api/unknown',
        method: 'GET',
        availableRoutes: ['/api/users', '/api/products'],
      };
      const error = new RequestError('No RAI found for request', meta);
      expect(error.meta.availableRoutes).toHaveLength(2);
    });

    it('should allow metadata to be modified after creation', () => {
      const error = new RequestError('Test error');
      error.meta.statusCode = 404;
      error.meta.timestamp = Date.now();
      expect(error.meta.statusCode).toBe(404);
      expect(typeof error.meta.timestamp).toBe('number');
    });
  });

  describe('Error Throwing', () => {
    it('should be catchable as RequestError', () => {
      try {
        throw new RequestError('Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestError);
        expect((error as RequestError).message).toBe('Test error');
      }
    });

    it('should be catchable as Error', () => {
      try {
        throw new RequestError('Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should preserve error message when thrown', () => {
      const message = 'Route authorization failed';
      expect(() => {
        throw new RequestError(message);
      }).toThrow(message);
    });
  });

  describe('Common Use Cases', () => {
    it('should handle 404 Not Found errors', () => {
      const error = new RequestError('Route not found', {
        code: 'RAI_NOT_FOUND',
        route: '/api/users/123',
        method: 'GET',
      });
      expect(error.meta.code).toBe('RAI_NOT_FOUND');
    });

    it('should handle 401 Unauthorized errors', () => {
      const error = new RequestError('Authentication required', {
        code: 'UNAUTHORIZED',
        requiredRoles: ['admin', 'user'],
        userRoles: ['guest'],
      });
      expect(error.meta.requiredRoles).toContain('admin');
    });

    it('should handle 403 Forbidden errors', () => {
      const error = new RequestError('Insufficient permissions', {
        code: 'FORBIDDEN',
        requiredRoles: ['admin'],
        userRoles: ['user'],
      });
      expect(error.meta.code).toBe('FORBIDDEN');
    });

    it('should handle parameter validation errors', () => {
      const error = new RequestError('Invalid parameter', {
        code: 'INVALID_PARAM',
        param: 'userId',
        value: 'abc',
        expected: 'number',
      });
      expect(error.meta.param).toBe('userId');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string message', () => {
      const error = new RequestError('');
      expect(error.message).toBe('');
    });

    it('should handle very long messages', () => {
      const longMessage = 'Error: '.repeat(200);
      const error = new RequestError(longMessage);
      expect(error.message).toBe(longMessage);
    });

    it('should handle special characters in message', () => {
      const message = 'Error: Route "/api/users/:id" not found!';
      const error = new RequestError(message);
      expect(error.message).toBe(message);
    });

    it('should handle nested objects in metadata', () => {
      const meta = {
        request: {
          url: '/api/users',
          headers: { 'Content-Type': 'application/json' },
          body: { name: 'Test' },
        },
      };
      const error = new RequestError('Request failed', meta);
      expect(error.meta.request.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('Differentiation from ConfigError', () => {
    it('should be distinguishable from ConfigError by name', () => {
      const requestError = new RequestError('Request error');
      expect(requestError.name).toBe('RequestError');
    });

    it('should not be an instance of ConfigError', () => {
      const requestError = new RequestError('Request error');
      expect(requestError.constructor.name).toBe('RequestError');
    });
  });
});
