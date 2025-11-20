import { describe, it, expect } from '@jest/globals';
import PostmanGroup from '../../src/lib/PostmanGroup.js';

describe('PostmanGroup', () => {
  describe('Constructor - Basic Properties', () => {
    it('should create an instance of PostmanGroup', () => {
      const postman = new PostmanGroup({ folderName: 'Test Folder' });
      expect(postman).toBeInstanceOf(PostmanGroup);
    });

    it('should set folderName correctly', () => {
      const folderName = 'User Management';
      const postman = new PostmanGroup({ folderName });
      expect(postman.folderName).toBe(folderName);
    });

    it('should initialize optional properties as undefined when not provided', () => {
      const postman = new PostmanGroup({ folderName: 'Test' });
      expect(postman.description).toBeUndefined();
      expect(postman.auth).toBeUndefined();
      expect(postman.variable).toBeUndefined();
      expect(postman.event).toBeUndefined();
      expect(postman.protocolProfileBehavior).toBeUndefined();
    });
  });

  describe('Description Property', () => {
    it('should handle string description', () => {
      const description = 'This is a test folder';
      const postman = new PostmanGroup({ folderName: 'Test', description });
      expect(postman.description).toBe(description);
    });

    it('should handle object description with content and type', () => {
      const description = {
        content: '# Test Folder\n\nThis is **markdown** content',
        type: 'text/markdown',
      };
      const postman = new PostmanGroup({ folderName: 'Test', description });
      expect(postman.description).toEqual(description);
    });

    it('should handle null description', () => {
      const postman = new PostmanGroup({ folderName: 'Test', description: null });
      expect(postman.description).toBeNull();
    });
  });

  describe('Authentication Property', () => {
    it('should handle bearer token authentication', () => {
      const auth = {
        type: 'bearer' as const,
        bearer: [{ key: 'token', value: '{{authToken}}', type: 'string' }],
      };
      const postman = new PostmanGroup({ folderName: 'Test', auth });
      expect(postman.auth).toEqual(auth);
      expect(postman.auth?.type).toBe('bearer');
    });

    it('should handle API key authentication', () => {
      const auth = {
        type: 'apikey' as const,
        apikey: [
          { key: 'key', value: 'X-API-Key', type: 'string' },
          { key: 'value', value: '{{apiKey}}', type: 'string' },
        ],
      };
      const postman = new PostmanGroup({ folderName: 'Test', auth });
      expect(postman.auth?.type).toBe('apikey');
    });

    it('should handle basic authentication', () => {
      const auth = {
        type: 'basic' as const,
        basic: [
          { key: 'username', value: '{{username}}', type: 'string' },
          { key: 'password', value: '{{password}}', type: 'string' },
        ],
      };
      const postman = new PostmanGroup({ folderName: 'Test', auth });
      expect(postman.auth?.type).toBe('basic');
    });

    it('should handle null auth (no authentication)', () => {
      const postman = new PostmanGroup({ folderName: 'Test', auth: null });
      expect(postman.auth).toBeNull();
    });
  });

  describe('Variables Property', () => {
    it('should handle single variable', () => {
      const variable = [
        { key: 'baseUrl', value: 'https://api.example.com', type: 'string' as const },
      ];
      const postman = new PostmanGroup({ folderName: 'Test', variable });
      expect(postman.variable).toHaveLength(1);
      expect(postman.variable?.[0].key).toBe('baseUrl');
    });

    it('should handle multiple variables with different types', () => {
      const variable = [
        { key: 'apiUrl', value: 'https://api.test.com', type: 'string' as const },
        { key: 'timeout', value: 5000, type: 'number' as const },
        { key: 'enableCache', value: true, type: 'boolean' as const },
      ];
      const postman = new PostmanGroup({ folderName: 'Test', variable });
      expect(postman.variable).toHaveLength(3);
      expect(postman.variable?.[1].type).toBe('number');
    });

    it('should handle variables with descriptions', () => {
      const variable = [
        {
          key: 'userId',
          value: '123',
          type: 'string' as const,
          description: 'The user ID for testing',
        },
      ];
      const postman = new PostmanGroup({ folderName: 'Test', variable });
      expect(postman.variable?.[0].description).toBe('The user ID for testing');
    });

    it('should handle empty variable array', () => {
      const postman = new PostmanGroup({ folderName: 'Test', variable: [] });
      expect(postman.variable).toHaveLength(0);
    });
  });

  describe('Events Property', () => {
    it('should handle prerequest event', () => {
      const event = [
        {
          listen: 'prerequest',
          script: {
            exec: ['console.log("Pre-request script");', 'pm.variables.set("timestamp", Date.now());'],
          },
        },
      ];
      const postman = new PostmanGroup({ folderName: 'Test', event });
      expect(postman.event).toHaveLength(1);
      expect(postman.event?.[0].listen).toBe('prerequest');
    });

    it('should handle test event', () => {
      const event = [
        {
          listen: 'test',
          script: {
            exec: ['pm.test("Status is 200", () => {', '  pm.response.to.have.status(200);', '});'],
          },
        },
      ];
      const postman = new PostmanGroup({ folderName: 'Test', event });
      expect(postman.event?.[0].listen).toBe('test');
    });

    it('should handle multiple events', () => {
      const event = [
        {
          listen: 'prerequest',
          script: { exec: ['console.log("before");'] },
        },
        {
          listen: 'test',
          script: { exec: ['pm.test("test", () => {});'] },
        },
      ];
      const postman = new PostmanGroup({ folderName: 'Test', event });
      expect(postman.event).toHaveLength(2);
    });

    it('should handle disabled event', () => {
      const event = [
        {
          listen: 'test',
          script: { exec: ['pm.test("test", () => {});'] },
          disabled: true,
        },
      ];
      const postman = new PostmanGroup({ folderName: 'Test', event });
      expect(postman.event?.[0].disabled).toBe(true);
    });
  });

  describe('Protocol Profile Behavior Property', () => {
    it('should handle protocol profile behavior settings', () => {
      const protocolProfileBehavior = {
        disableBodyPruning: true,
        followRedirects: true,
        maxRedirects: 10,
      };
      const postman = new PostmanGroup({ folderName: 'Test', protocolProfileBehavior });
      expect(postman.protocolProfileBehavior).toEqual(protocolProfileBehavior);
    });

    it('should handle all protocol behavior options', () => {
      const protocolProfileBehavior = {
        disableBodyPruning: false,
        disableCookies: true,
        followRedirects: true,
        followOriginalHttpMethod: false,
        followAuthorizationHeader: true,
        maxRedirects: 5,
        strictSSL: true,
      };
      const postman = new PostmanGroup({ folderName: 'Test', protocolProfileBehavior });
      expect(postman.protocolProfileBehavior?.strictSSL).toBe(true);
      expect(postman.protocolProfileBehavior?.maxRedirects).toBe(5);
    });
  });

  describe('Complete Configuration', () => {
    it('should handle all properties together', () => {
      const config = {
        folderName: 'Complete Example',
        description: {
          content: '# Complete Configuration',
          type: 'text/markdown',
        },
        auth: {
          type: 'bearer' as const,
          bearer: [{ key: 'token', value: '{{token}}' }],
        },
        variable: [
          { key: 'baseUrl', value: 'https://api.test.com', type: 'string' as const },
        ],
        event: [
          {
            listen: 'prerequest',
            script: { exec: ['console.log("test");'] },
          },
        ],
        protocolProfileBehavior: {
          followRedirects: true,
        },
      };
      const postman = new PostmanGroup(config);
      expect(postman.folderName).toBe('Complete Example');
      expect(postman.description).toEqual(config.description);
      expect(postman.auth).toEqual(config.auth);
      expect(postman.variable).toEqual(config.variable);
      expect(postman.event).toEqual(config.event);
      expect(postman.protocolProfileBehavior).toEqual(config.protocolProfileBehavior);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty folderName', () => {
      const postman = new PostmanGroup({ folderName: '' });
      expect(postman.folderName).toBe('');
    });

    it('should handle very long folderName', () => {
      const longName = 'Folder '.repeat(100);
      const postman = new PostmanGroup({ folderName: longName });
      expect(postman.folderName.length).toBeGreaterThan(500);
    });

    it('should handle special characters in folderName', () => {
      const folderName = 'API / Routes & Endpoints';
      const postman = new PostmanGroup({ folderName });
      expect(postman.folderName).toBe(folderName);
    });
  });

  describe('Property Modification', () => {
    it('should allow modifying properties after creation', () => {
      const postman = new PostmanGroup({ folderName: 'Initial' });
      postman.folderName = 'Modified';
      postman.description = 'New description';
      expect(postman.folderName).toBe('Modified');
      expect(postman.description).toBe('New description');
    });
  });
});
