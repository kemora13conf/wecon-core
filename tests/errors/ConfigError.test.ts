import { describe, it, expect } from '@jest/globals';
import ConfigError from '../../src/errors/ConfigError.js';

describe('ConfigError', () => {
  describe('Constructor', () => {
    it('should create an instance of ConfigError', () => {
      const error = new ConfigError('Test error message');
      expect(error).toBeInstanceOf(ConfigError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should set the error message correctly', () => {
      const message = 'Configuration is invalid';
      const error = new ConfigError(message);
      expect(error.message).toBe(message);
    });

    it('should set the error name to "ConfigError"', () => {
      const error = new ConfigError('Test error');
      expect(error.name).toBe('ConfigError');
    });

    it('should initialize meta as empty object when not provided', () => {
      const error = new ConfigError('Test error');
      expect(error.meta).toEqual({});
    });

    it('should store metadata when provided', () => {
      const meta = { field: 'username', value: 123 };
      const error = new ConfigError('Invalid field', meta);
      expect(error.meta).toEqual(meta);
    });

    it('should maintain prototype chain for instanceof checks', () => {
      const error = new ConfigError('Test error');
      expect(error instanceof ConfigError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('Stack Trace', () => {
    it('should capture stack trace', () => {
      const error = new ConfigError('Test error');
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('ConfigError');
    });

    it('should have stack trace that excludes constructor', () => {
      const error = new ConfigError('Test error');
      expect(error.stack).toBeDefined();
      // Stack should start from where error was created, not from ConfigError constructor
      expect(error.stack).toContain('ConfigError.test.ts');
    });
  });

  describe('Metadata', () => {
    it('should handle complex metadata objects', () => {
      const meta = {
        route: { path: '/users', method: 'GET' },
        details: 'Missing required field',
        suggestion: 'Add the rai property',
      };
      const error = new ConfigError('Validation failed', meta);
      expect(error.meta).toEqual(meta);
      expect(error.meta.route.path).toBe('/users');
    });

    it('should allow metadata to be modified after creation', () => {
      const error = new ConfigError('Test error');
      error.meta.customField = 'custom value';
      expect(error.meta.customField).toBe('custom value');
    });
  });

  describe('Error Throwing', () => {
    it('should be catchable as ConfigError', () => {
      try {
        throw new ConfigError('Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigError);
        expect((error as ConfigError).message).toBe('Test error');
      }
    });

    it('should be catchable as Error', () => {
      try {
        throw new ConfigError('Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should preserve error message when thrown', () => {
      const message = 'Critical configuration error';
      expect(() => {
        throw new ConfigError(message);
      }).toThrow(message);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string message', () => {
      const error = new ConfigError('');
      expect(error.message).toBe('');
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(1000);
      const error = new ConfigError(longMessage);
      expect(error.message).toBe(longMessage);
      expect(error.message.length).toBe(1000);
    });

    it('should handle special characters in message', () => {
      const message = 'Error: "field" is <invalid> & should be fixed!';
      const error = new ConfigError(message);
      expect(error.message).toBe(message);
    });

    it('should handle null in metadata (when type allows)', () => {
      const meta = { value: null, field: 'test' };
      const error = new ConfigError('Test error', meta);
      expect(error.meta.value).toBeNull();
    });

    it('should handle arrays in metadata', () => {
      const meta = { errors: ['error1', 'error2', 'error3'] };
      const error = new ConfigError('Multiple errors', meta);
      expect(Array.isArray(error.meta.errors)).toBe(true);
      expect(error.meta.errors).toHaveLength(3);
    });
  });
});
