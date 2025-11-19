# PostmanGenerator Usage Guide

The `PostmanGenerator` is an intelligent utility class that automatically generates Postman collections and environment files from your Wecon routes. It extracts variables from route paths, custom configurations, and creates a complete API documentation automatically.

## Features

✨ **Smart Variable Extraction**
- Automatically extracts path parameters (`:userId` → `{{userId}}`)
- Collects custom variables from `PostmanForRoute` and `PostmanForRoutes`
- Detects variables in headers, query params, and request bodies
- Generates environment file with all discovered variables

📁 **Hierarchical Structure**
- Maintains folder structure from `Routes` organization
- Respects custom folder names from `PostmanForRoutes`
- Properly nests requests within folders

🎯 **Complete Configuration Support**
- Headers, auth, events, variables from route configs
- Sample responses and test scripts
- Protocol profile behaviors
- Request body examples

## Basic Usage with Wecon

The easiest way to use PostmanGenerator is through the Wecon fluent API:

```typescript
import { Wecon, Routes, Route, PostmanForRoute } from '@wecon/core';

const routes = new Routes({
  prefix: '/api',
  routes: [
    new Route({
      path: '/users/:userId',
      method: 'GET',
      name: 'Get User',
      rai: 'users:read',
      roles: ['admin', 'user'],
      middlewares: [getUserHandler],
      postman: new PostmanForRoute({
        headers: {
          'Authorization': 'Bearer {{authToken}}'
        }
      })
    })
  ]
});

const wecon = new Wecon()
  .routes(routes)
  .roles(['admin', 'user', 'guest'])
  .guestRole('guest')
  .postman({
    name: 'My API',
    description: 'Complete API documentation',
    baseUrl: 'http://localhost:3000',
    version: '1.0.0',
    autoGenerate: true,  // Generate on build()
    output: {
      collection: './postman/collection.json',
      environment: './postman/environment.json'
    }
  })
  .build();
```

When you call `.build()`, the PostmanGenerator will:
1. Scan all routes and extract variables
2. Generate a complete Postman collection
3. Create an environment file with all variables
4. Save both files to the specified paths

## Manual Usage

You can also use PostmanGenerator directly without Wecon:

```typescript
import { PostmanGenerator, Routes, Route } from '@wecon/core';

const routes = new Routes({
  prefix: '/api/v1',
  routes: [/* your routes */]
});

const { collection, environment } = await PostmanGenerator.generateFromWecon(
  {
    name: 'My API',
    description: 'API Documentation',
    baseUrl: 'https://api.example.com',
    version: '1.0.0',
    output: {
      collection: './postman_collection.json',
      environment: './postman_environment.json'
    }
  },
  routes
);

console.log('Collection items:', collection.item.length);
console.log('Environment variables:', environment.values.length);
```

## Variable Extraction Examples

### Path Parameters

Path parameters are automatically extracted:

```typescript
new Route({
  path: '/users/:userId/posts/:postId',
  method: 'GET',
  // ...
})
```

Generated environment variables:
```json
{
  "key": "userId",
  "value": "",
  "description": "Path parameter extracted from route"
}
```

### Custom Variables

Define custom variables in PostmanForRoute:

```typescript
new Route({
  path: '/users',
  method: 'POST',
  postman: new PostmanForRoute({
    variable: [
      {
        key: 'defaultEmail',
        value: 'test@example.com',
        type: 'string',
        description: 'Default test email'
      }
    ],
    body: {
      mode: 'raw',
      raw: JSON.stringify({
        email: '{{defaultEmail}}'
      })
    }
  })
})
```

### Header Variables

Variables referenced in headers are auto-detected:

```typescript
new PostmanForRoute({
  headers: {
    'Authorization': 'Bearer {{authToken}}',
    'X-API-Key': '{{apiKey}}'
  }
})
```

Both `authToken` and `apiKey` will be added to the environment file.

### Query Parameters

Query parameters become environment variables:

```typescript
new PostmanForRoute({
  query: {
    page: '1',
    limit: '10',
    sortBy: 'createdAt'
  }
})
```

## Complete Example

```typescript
import express from 'express';
import {
  Wecon,
  Routes,
  Route,
  PostmanForRoute,
  PostmanForRoutes
} from '@wecon/core';

// Define routes with Postman configuration
const userRoutes = new Routes({
  prefix: '/api/users',
  routes: [
    new Route({
      path: '',
      method: 'GET',
      name: 'List Users',
      rai: 'users:list',
      roles: ['admin', 'user'],
      middlewares: [listUsersHandler],
      postman: new PostmanForRoute({
        name: 'Get All Users',
        description: 'Retrieve paginated list of users',
        query: {
          page: '1',
          limit: '10'
        },
        event: [
          {
            listen: 'test',
            script: {
              type: 'text/javascript',
              exec: [
                'pm.test("Status code is 200", () => {',
                '    pm.response.to.have.status(200);',
                '});'
              ]
            }
          }
        ]
      })
    }),

    new Route({
      path: '/:userId',
      method: 'GET',
      name: 'Get User by ID',
      rai: 'users:read',
      roles: ['admin', 'user'],
      middlewares: [getUserHandler],
      postman: new PostmanForRoute({
        headers: {
          'Authorization': 'Bearer {{authToken}}'
        },
        variable: [
          {
            key: 'userId',
            value: '12345',
            type: 'string',
            description: 'Example user ID'
          }
        ]
      })
    }),

    new Route({
      path: '',
      method: 'POST',
      name: 'Create User',
      rai: 'users:create',
      roles: ['admin'],
      middlewares: [createUserHandler],
      postman: new PostmanForRoute({
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {{authToken}}'
        },
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            email: '{{userEmail}}',
            name: '{{userName}}',
            role: 'user'
          }, null, 2),
          options: {
            raw: { language: 'json' }
          }
        },
        response: [
          {
            name: 'Success',
            code: 201,
            status: 'Created',
            body: JSON.stringify({
              id: '12345',
              email: 'newuser@example.com',
              name: 'New User',
              role: 'user'
            }, null, 2)
          }
        ]
      })
    })
  ],
  postman: new PostmanForRoutes({
    folderName: 'User Management',
    description: 'Endpoints for managing users',
    variable: [
      {
        key: 'authToken',
        value: '',
        type: 'string',
        description: 'JWT authentication token'
      }
    ]
  })
});

// Create Wecon instance with Postman generation
const app = express();
app.use(express.json());

const wecon = new Wecon()
  .routes(userRoutes)
  .roles(['admin', 'user', 'guest'])
  .guestRole('guest')
  .postman({
    name: 'User Management API',
    description: 'Complete user management system',
    baseUrl: 'http://localhost:3000',
    version: '1.0.0',
    autoGenerate: true,
    output: {
      collection: './postman/collection.json',
      environment: './postman/environment.json'
    }
  })
  .dev({
    debugMode: true,
    logRoutes: true
  })
  .build();

app.use(wecon.handler());

app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('Postman files generated in ./postman directory');
});
```

## Generated Files

### Collection File (`collection.json`)

```json
{
  "info": {
    "name": "User Management API",
    "description": "Complete user management system",
    "version": "1.0.0",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "User Management",
      "description": "Endpoints for managing users",
      "item": [
        {
          "name": "Get All Users",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/users?page=1&limit=10"
          },
          "event": [...]
        },
        {
          "name": "Get User by ID",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/users/{{userId}}",
            "header": [
              { "key": "Authorization", "value": "Bearer {{authToken}}" }
            ]
          }
        },
        {
          "name": "Create User",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/users",
            "header": [
              { "key": "Content-Type", "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{authToken}}" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"{{userEmail}}\",\n  \"name\": \"{{userName}}\",\n  \"role\": \"user\"\n}"
            }
          },
          "response": [...]
        }
      ],
      "variable": [
        {
          "key": "authToken",
          "value": "",
          "type": "string",
          "description": "JWT authentication token"
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "type": "string",
      "description": "Base URL for all API requests"
    }
  ]
}
```

### Environment File (`environment.json`)

```json
{
  "name": "User Management API - Environment",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "type": "default",
      "enabled": true,
      "description": "Base URL for all API requests"
    },
    {
      "key": "authToken",
      "value": "",
      "type": "default",
      "enabled": true,
      "description": "JWT authentication token"
    },
    {
      "key": "userId",
      "value": "",
      "type": "default",
      "enabled": true,
      "description": "Path parameter extracted from route"
    },
    {
      "key": "userEmail",
      "value": "",
      "type": "default",
      "enabled": true,
      "description": "Extracted from request body"
    },
    {
      "key": "userName",
      "value": "",
      "type": "default",
      "enabled": true,
      "description": "Extracted from request body"
    }
  ],
  "_postman_variable_scope": "environment",
  "_postman_exported_at": "2025-11-19T10:00:00.000Z",
  "_postman_exported_using": "Wecon PostmanGenerator"
}
```

## Importing into Postman

1. Open Postman
2. Click "Import" button
3. Select the generated `collection.json` file
4. Import the `environment.json` file
5. Select the environment from the dropdown
6. Fill in variable values (like `authToken`)
7. Start testing your API!

## Best Practices

1. **Use meaningful variable names** - They'll appear in the environment file
2. **Provide default values** - Makes testing easier
3. **Add descriptions** - Help team members understand variables
4. **Group related routes** - Use `PostmanForRoutes` for folder organization
5. **Include test scripts** - Automated validation of responses
6. **Add sample responses** - Document expected outputs
7. **Version your files** - Commit generated Postman files to git

## Configuration Options

### PostmanGeneratorConfig

| Option | Type | Description |
|--------|------|-------------|
| `name` | string | Name of the Postman collection (required) |
| `description` | string | Description of the API |
| `baseUrl` | string | Base URL for all requests (becomes `{{baseUrl}}` variable) |
| `version` | string | API version (default: "1.0.0") |
| `output.collection` | string | File path for collection JSON |
| `output.environment` | string | File path for environment JSON |

### WeconPostmanConfig

Same as `PostmanGeneratorConfig` plus:

| Option | Type | Description |
|--------|------|-------------|
| `autoGenerate` | boolean | Auto-generate on `.build()` call |

## Advanced Features

### Programmatic Generation

Generate files programmatically without saving:

```typescript
const wecon = new Wecon()
  .routes(routes)
  .postman({
    name: 'My API',
    // Don't specify output paths
  })
  .build();

// Generate manually
await wecon.generatePostman();
```

### Custom Variable Processing

Access generated data before saving:

```typescript
const { collection, environment } = await PostmanGenerator.generateFromWecon(
  config,
  routes
);

// Modify or inspect
environment.values.forEach(v => {
  if (!v.value) {
    v.value = 'TODO: Set this value';
  }
});

// Save manually
fs.writeFileSync('custom-collection.json', JSON.stringify(collection, null, 2));
```

## Troubleshooting

### Variables not extracted

- Ensure variables use `{{varName}}` syntax
- Check that PostmanForRoute is properly configured
- Verify the variable is actually used in headers/body/query

### Folder structure incorrect

- Set `folderName` in `PostmanForRoutes`
- Check Routes nesting structure
- Ensure `prefix` is set correctly

### Missing routes in collection

- Verify routes are properly nested in Routes
- Check that Route instances are created correctly
- Ensure `.build()` was called before generation

## Summary

The PostmanGenerator provides:
- ✅ Automatic collection generation from routes
- ✅ Smart variable extraction and environment creation
- ✅ Hierarchical folder structure
- ✅ Complete configuration support
- ✅ Easy integration with Wecon
- ✅ Manual control when needed

Perfect for teams that want automated, always-up-to-date API documentation!
