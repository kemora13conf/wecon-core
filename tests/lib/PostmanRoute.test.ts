import { describe, it, expect } from '@jest/globals';
import PostmanRoute from '../../src/lib/PostmanRoute.js';

describe('PostmanRoute', () => {
  describe('Constructor', () => {
    it('should create an instance of PostmanRoute', () => {
      const postman = new PostmanRoute({ name: 'Test Route' });
      expect(postman).toBeInstanceOf(PostmanRoute);
    });

    it('should set name correctly', () => {
      const name = 'Create User';
      const postman = new PostmanRoute({ name });
      expect(postman.name).toBe(name);
    });

    it('should handle empty name', () => {
      const postman = new PostmanRoute({ name: '' });
      expect(postman.name).toBe('');
    });
  });

  describe('Properties', () => {
    it('should set description correctly', () => {
      const description = 'This is a test route';
      const postman = new PostmanRoute({ name: 'Test', description });
      expect(postman.description).toBe(description);
    });

    it('should set auth correctly', () => {
      const auth = {
        type: 'bearer' as const,
        bearer: [{ key: 'token', value: '{{token}}' }],
      };
      const postman = new PostmanRoute({ name: 'Test', auth });
      expect(postman.auth).toEqual(auth);
    });

    it('should set headers correctly', () => {
      const headers = { 'Content-Type': 'application/json' };
      const postman = new PostmanRoute({ name: 'Test', headers });
      expect(postman.headers).toEqual(headers);
    });

    it('should set query params correctly', () => {
      const query = { page: '1', limit: '10' };
      const postman = new PostmanRoute({ name: 'Test', query });
      expect(postman.query).toEqual(query);
    });

    it('should set body correctly', () => {
      const body = {
        mode: 'raw' as const,
        raw: '{"test": true}',
      };
      const postman = new PostmanRoute({ name: 'Test', body });
      expect(postman.body).toEqual(body);
    });
  });

  describe('toPostmanItem', () => {
    it('should generate a valid Postman item', () => {
      const postman = new PostmanRoute({
        name: 'Custom Name',
        description: 'Custom Description',
      });

      const route = {
        method: 'GET',
        path: '/users/:id',
        name: 'Default Name',
        description: 'Default Description',
        rai: 'users:get',
      };

      const item = postman.toPostmanItem(route);

      expect(item.name).toBe('Custom Name');
      expect(item.description).toBe('Custom Description');
      expect(item.request).toBeDefined();
      if (typeof item.request !== 'string') {
        expect(item.request.method).toBe('GET');
        expect(item.request.url).toBeDefined();
      }
    });

    it('should use route defaults when not provided in config', () => {
      const postman = new PostmanRoute({});

      const route = {
        method: 'POST',
        path: '/users',
        name: 'Create User',
        description: 'Creates a new user',
        rai: 'users:create',
      };

      const item = postman.toPostmanItem(route);

      expect(item.name).toBe('Create User');
      expect(item.description).toBe('Creates a new user');
    });

    it('should convert path parameters correctly', () => {
      const postman = new PostmanRoute({});
      const route = {
        method: 'GET',
        path: '/users/:userId/posts/:postId',
        name: 'Get Post',
        description: 'Get post details',
        rai: 'posts:get',
      };

      const item = postman.toPostmanItem(route);

      if (typeof item.request !== 'string' && typeof item.request.url !== 'string') {
        expect(item.request.url.raw).toContain('/users/{{userId}}/posts/{{postId}}');
      }
    });
  });
});
