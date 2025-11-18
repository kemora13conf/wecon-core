/**
 * Example: Advanced PostmanForRoutes Configuration
 *
 * This example demonstrates how to use the PostmanForRoutes class
 * to configure Postman collection folders with authentication, variables,
 * scripts, and other properties based on the Postman Collection v2.1.0 schema.
 */

import { Routes, Route, PostmanForRoutes } from "@wecon/core";
import type { PostmanForRoutesConfig } from "@wecon/core";

// ============================================================================
// Example 1: Basic Folder Configuration
// ============================================================================

const basicRoutes = new Routes({
  prefix: "/api/users",
  routes: [
    /* routes here */
  ],
  postman: new PostmanForRoutes({
    folderName: "User Management",
    description: "All endpoints related to user management",
  }),
});

// ============================================================================
// Example 2: Folder with Bearer Token Authentication
// ============================================================================

const authenticatedRoutes = new Routes({
  prefix: "/api/admin",
  routes: [
    /* routes here */
  ],
  postman: new PostmanForRoutes({
    folderName: "Admin Panel",
    description: {
      content: "Protected admin endpoints requiring authentication",
      type: "text/markdown",
    },
    auth: {
      type: "bearer",
      bearer: [
        {
          key: "token",
          value: "{{authToken}}",
          type: "string",
        },
      ],
    },
  }),
});

// ============================================================================
// Example 3: Folder with API Key Authentication
// ============================================================================

const apiKeyRoutes = new Routes({
  prefix: "/api/public",
  routes: [
    /* routes here */
  ],
  postman: new PostmanForRoutes({
    folderName: "Public API",
    description: "Public endpoints requiring API key",
    auth: {
      type: "apikey",
      apikey: [
        {
          key: "key",
          value: "X-API-Key",
          type: "string",
        },
        {
          key: "value",
          value: "{{apiKey}}",
          type: "string",
        },
        {
          key: "in",
          value: "header",
          type: "string",
        },
      ],
    },
  }),
});

// ============================================================================
// Example 4: Folder with Variables
// ============================================================================

const routesWithVariables = new Routes({
  prefix: "/api/v1",
  routes: [
    /* routes here */
  ],
  postman: new PostmanForRoutes({
    folderName: "API v1",
    description: "Version 1 of the API with environment variables",
    variable: [
      {
        key: "baseUrl",
        value: "https://api.example.com",
        type: "string",
        description: "Base URL for the API",
      },
      {
        key: "timeout",
        value: 5000,
        type: "number",
        description: "Request timeout in milliseconds",
      },
      {
        key: "retryEnabled",
        value: true,
        type: "boolean",
        description: "Whether to retry failed requests",
      },
    ],
  }),
});

// ============================================================================
// Example 5: Folder with Pre-request and Test Scripts
// ============================================================================

const routesWithScripts = new Routes({
  prefix: "/api/orders",
  routes: [
    /* routes here */
  ],
  postman: new PostmanForRoutes({
    folderName: "Orders",
    description: "Order management endpoints with automated testing",
    event: [
      {
        listen: "prerequest",
        script: {
          type: "text/javascript",
          exec: [
            "// Set timestamp for request",
            "pm.variables.set('timestamp', new Date().toISOString());",
            "",
            "// Generate request ID",
            "pm.variables.set('requestId', pm.variables.replaceIn('{{$guid}}'));",
          ],
        },
      },
      {
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "// Verify response status",
            "pm.test('Status code is 200', function () {",
            "    pm.response.to.have.status(200);",
            "});",
            "",
            "// Verify response time",
            "pm.test('Response time is less than 500ms', function () {",
            "    pm.expect(pm.response.responseTime).to.be.below(500);",
            "});",
            "",
            "// Verify JSON response",
            "pm.test('Response is valid JSON', function () {",
            "    pm.response.to.be.json;",
            "});",
          ],
        },
      },
    ],
  }),
});

// ============================================================================
// Example 6: Folder with OAuth2 Authentication
// ============================================================================

const oauth2Routes = new Routes({
  prefix: "/api/oauth",
  routes: [
    /* routes here */
  ],
  postman: new PostmanForRoutes({
    folderName: "OAuth Protected",
    description: "Endpoints protected with OAuth 2.0",
    auth: {
      type: "oauth2",
      oauth2: [
        {
          key: "accessToken",
          value: "{{accessToken}}",
          type: "string",
        },
        {
          key: "addTokenTo",
          value: "header",
          type: "string",
        },
        {
          key: "tokenType",
          value: "Bearer",
          type: "string",
        },
      ],
    },
  }),
});

// ============================================================================
// Example 7: Folder with Basic Authentication
// ============================================================================

const basicAuthRoutes = new Routes({
  prefix: "/api/legacy",
  routes: [
    /* routes here */
  ],
  postman: new PostmanForRoutes({
    folderName: "Legacy API",
    description: "Legacy endpoints using Basic Auth",
    auth: {
      type: "basic",
      basic: [
        {
          key: "username",
          value: "{{username}}",
          type: "string",
        },
        {
          key: "password",
          value: "{{password}}",
          type: "string",
        },
      ],
    },
  }),
});

// ============================================================================
// Example 8: Folder with Protocol Profile Behavior
// ============================================================================

const customBehaviorRoutes = new Routes({
  prefix: "/api/files",
  routes: [
    /* routes here */
  ],
  postman: new PostmanForRoutes({
    folderName: "File Operations",
    description: "File upload and download endpoints",
    protocolProfileBehavior: {
      disableBodyPruning: true, // Don't remove body for GET requests
      followRedirects: true,
      followOriginalHttpMethod: false,
      followAuthorizationHeader: true,
      maxRedirects: 5,
      strictSSL: true,
    },
  }),
});

// ============================================================================
// Example 9: Comprehensive Configuration
// ============================================================================

const comprehensiveConfig: PostmanForRoutesConfig = {
  folderName: "Complete Example",
  description: {
    content: `
# Complete Postman Folder Configuration

This folder demonstrates all available configuration options for PostmanForRoutes.

## Features
- Bearer token authentication
- Environment variables
- Pre-request and test scripts
- Custom protocol behavior
    `,
    type: "text/markdown",
  },
  auth: {
    type: "bearer",
    bearer: [
      {
        key: "token",
        value: "{{authToken}}",
        type: "string",
      },
    ],
  },
  variable: [
    {
      key: "apiVersion",
      value: "v1",
      type: "string",
      description: "API version to use",
    },
    {
      key: "userId",
      value: "123",
      type: "string",
      description: "Test user ID",
    },
  ],
  event: [
    {
      listen: "prerequest",
      script: {
        exec: [
          "// Initialize request",
          "console.log('Starting request...');",
          "pm.variables.set('requestTime', Date.now());",
        ],
      },
      disabled: false,
    },
    {
      listen: "test",
      script: {
        exec: [
          "// Verify response",
          "const responseTime = Date.now() - pm.variables.get('requestTime');",
          "console.log(`Request completed in ${responseTime}ms`);",
          "",
          "pm.test('Status is successful', function () {",
          "    pm.response.to.be.success;",
          "});",
        ],
      },
      disabled: false,
    },
  ],
  protocolProfileBehavior: {
    disableBodyPruning: false,
    followRedirects: true,
    maxRedirects: 10,
    strictSSL: true,
  },
};

const comprehensiveRoutes = new Routes({
  prefix: "/api/complete",
  routes: [
    /* routes here */
  ],
  postman: new PostmanForRoutes(comprehensiveConfig),
});

// ============================================================================
// Example 10: No Authentication (Explicitly set to null)
// ============================================================================

const noAuthRoutes = new Routes({
  prefix: "/api/public/health",
  routes: [
    /* routes here */
  ],
  postman: new PostmanForRoutes({
    folderName: "Health Checks",
    description: "Public health check endpoints with no authentication required",
    auth: null, // Explicitly disable authentication for this folder
  }),
});

// ============================================================================
// Export examples for reference
// ============================================================================

export {
  basicRoutes,
  authenticatedRoutes,
  apiKeyRoutes,
  routesWithVariables,
  routesWithScripts,
  oauth2Routes,
  basicAuthRoutes,
  customBehaviorRoutes,
  comprehensiveRoutes,
  noAuthRoutes,
  comprehensiveConfig,
};
