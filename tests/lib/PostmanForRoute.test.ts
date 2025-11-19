import { describe, it, expect } from '@jest/globals';
import PostmanForRoute from '../../src/lib/PostmanForRoute.js';

describe('PostmanForRoute', () => {
  describe('Constructor', () => {
    it('should create an instance of PostmanForRoute', () => {
      const postman = new PostmanForRoute({ folderName: 'Test Folder' });
      expect(postman).toBeInstanceOf(PostmanForRoute);
    });

    it('should set folderName correctly', () => {
      const folderName = 'User Routes';
      const postman = new PostmanForRoute({ folderName });
      expect(postman.folderName).toBe(folderName);
    });

    it('should handle empty folderName', () => {
      const postman = new PostmanForRoute({ folderName: '' });
      expect(postman.folderName).toBe('');
    });

    it('should handle folderName with special characters', () => {
      const folderName = 'API / Users & Products';
      const postman = new PostmanForRoute({ folderName });
      expect(postman.folderName).toBe(folderName);
    });
  });

  describe('Property Access', () => {
    it('should allow reading folderName property', () => {
      const postman = new PostmanForRoute({ folderName: 'Test' });
      const name = postman.folderName;
      expect(name).toBe('Test');
    });

    it('should allow modifying folderName after creation', () => {
      const postman = new PostmanForRoute({ folderName: 'Initial' });
      postman.folderName = 'Modified';
      expect(postman.folderName).toBe('Modified');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long folderName', () => {
      const longName = 'A'.repeat(1000);
      const postman = new PostmanForRoute({ folderName: longName });
      expect(postman.folderName).toBe(longName);
      expect(postman.folderName.length).toBe(1000);
    });

    it('should handle folderName with newlines', () => {
      const folderName = 'Line 1\nLine 2\nLine 3';
      const postman = new PostmanForRoute({ folderName });
      expect(postman.folderName).toBe(folderName);
    });

    it('should handle folderName with unicode characters', () => {
      const folderName = 'Users 用户 👤';
      const postman = new PostmanForRoute({ folderName });
      expect(postman.folderName).toBe(folderName);
    });
  });
});
