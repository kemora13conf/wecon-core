# PostmanForRoute Usage Guide

The `PostmanForRoute` class allows you to configure detailed Postman collection items for individual routes. This enables automatic generation of comprehensive API documentation with request examples, test scripts, and sample responses.

## Basic Usage

```typescript
import { Route, PostmanForRoute } from '@wecon/core';

const route = new Route({
  path: '/users',
  method: 'POST',
  name: 'Create User',
  description: 'Create a new user account',
  roles: ['admin'],
  rai: 'users:create',
  middlewares: [createUserHandler],

  // Configure Postman documentation
  postman: new PostmanForRoute({
    name: 'Create User Account',
    description: 'Creates a new user with email, name, and role',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {{authToken}}'
    },
    body: {
      mode: 'raw',
      raw: JSON.stringify({
        email: 'user@example.com',
        name: 'John Doe',
        role: 'user'
      }, null, 2),
      options: {
        raw: {
          language: 'json'
        }
      }
    }
  })
});
```

## Configuration Options

### Headers

Add custom headers to the request:

```typescript
postman: new PostmanForRoute({
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {{authToken}}',
    'X-Custom-Header': 'value'
  }
})
```

### Query Parameters

Add query parameters:

```typescript
postman: new PostmanForRoute({
  query: {
    page: '1',
    limit: '10',
    sortBy: 'createdAt'
  }
})
```

### Request Body

Configure different body types:

#### JSON Body (Raw)

```typescript
body: {
  mode: 'raw',
  raw: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123'
  }, null, 2),
  options: {
    raw: {
      language: 'json'
    }
  }
}
```

#### URL-Encoded Form

```typescript
body: {
  mode: 'urlencoded',
  urlencoded: [
    { key: 'username', value: 'johndoe' },
    { key: 'password', value: 'secret123' }
  ]
}
```

#### Form Data (Multipart)

```typescript
body: {
  mode: 'formdata',
  formdata: [
    { key: 'name', value: 'John Doe', type: 'text' },
    { key: 'avatar', value: '/path/to/file.jpg', type: 'file' }
  ]
}
```

#### GraphQL

```typescript
body: {
  mode: 'graphql',
  graphql: {
    query: `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
        }
      }
    `,
    variables: JSON.stringify({ id: '123' })
  }
}
```

### Sample Responses

Add example responses for documentation:

```typescript
response: [
  {
    name: 'Success - User Created',
    code: 201,
    status: 'Created',
    _postman_previewlanguage: 'json',
    header: [
      { key: 'Content-Type', value: 'application/json' }
    ],
    body: JSON.stringify({
      success: true,
      data: {
        id: 'user_123',
        email: 'user@example.com',
        name: 'John Doe',
        createdAt: '2025-11-19T10:00:00Z'
      }
    }, null, 2)
  },
  {
    name: 'Error - Validation Failed',
    code: 400,
    status: 'Bad Request',
    _postman_previewlanguage: 'json',
    header: [
      { key: 'Content-Type', value: 'application/json' }
    ],
    body: JSON.stringify({
      success: false,
      error: 'Validation failed',
      details: ['Email is required', 'Password must be at least 8 characters']
    }, null, 2)
  }
]
```

### Test Scripts

Add automated tests for the endpoint:

```typescript
event: [
  {
    listen: 'test',
    script: {
      type: 'text/javascript',
      exec: [
        'pm.test("Status code is 200", function () {',
        '    pm.response.to.have.status(200);',
        '});',
        '',
        'pm.test("Response has user data", function () {',
        '    const jsonData = pm.response.json();',
        '    pm.expect(jsonData.success).to.be.true;',
        '    pm.expect(jsonData.data).to.have.property("id");',
        '    pm.expect(jsonData.data).to.have.property("email");',
        '});',
        '',
        '// Save user ID for subsequent requests',
        'if (pm.response.code === 200) {',
        '    const userId = pm.response.json().data.id;',
        '    pm.environment.set("userId", userId);',
        '}'
      ]
    }
  }
]
```

### Pre-request Scripts

Add scripts that run before the request:

```typescript
event: [
  {
    listen: 'prerequest',
    script: {
      type: 'text/javascript',
      exec: [
        '// Generate a timestamp',
        'pm.environment.set("timestamp", Date.now());',
        '',
        '// Log request details',
        'console.log("Sending request to:", pm.request.url);'
      ]
    }
  }
]
```

### Authentication

Configure authentication for specific requests:

```typescript
auth: {
  type: 'bearer',
  bearer: [
    { key: 'token', value: '{{authToken}}' }
  ]
}
```

Or disable authentication inheritance:

```typescript
auth: null  // Disables parent authentication
```

### Variables

Define variables scoped to this request:

```typescript
variable: [
  {
    key: 'userId',
    value: '123',
    type: 'string'
  },
  {
    key: 'isActive',
    value: true,
    type: 'boolean'
  }
]
```

### Protocol Profile Behavior

Customize request behavior:

```typescript
protocolProfileBehavior: {
  disableBodyPruning: true,
  followRedirects: false,
  strictSSL: true
}
```

## Complete Example

```typescript
import { Route, Routes, PostmanForRoute, PostmanForRoutes } from '@wecon/core';

const userRoutes = new Routes({
  prefix: '/api/users',
  routes: [
    new Route({
      path: '',
      method: 'POST',
      name: 'Create User',
      description: 'Create a new user account',
      roles: ['admin'],
      rai: 'users:create',
      middlewares: [createUserHandler],

      postman: new PostmanForRoute({
        name: 'Create User Account',
        description: 'Creates a new user with email, name, and role',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {{authToken}}'
        },
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            email: 'john.doe@example.com',
            name: 'John Doe',
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
            _postman_previewlanguage: 'json',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: JSON.stringify({
              success: true,
              data: {
                id: 'user_123',
                email: 'john.doe@example.com',
                name: 'John Doe',
                role: 'user'
              }
            }, null, 2)
          }
        ],
        event: [
          {
            listen: 'test',
            script: {
              type: 'text/javascript',
              exec: [
                'pm.test("Status code is 201", function () {',
                '    pm.response.to.have.status(201);',
                '});',
                '',
                'pm.test("User created successfully", function () {',
                '    const jsonData = pm.response.json();',
                '    pm.expect(jsonData.success).to.be.true;',
                '    pm.expect(jsonData.data.id).to.exist;',
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
      name: 'Get User',
      description: 'Retrieve user by ID',
      roles: ['admin', 'user'],
      rai: 'users:read',
      middlewares: [getUserHandler],

      postman: new PostmanForRoute({
        name: 'Get User by ID',
        description: 'Fetches a user by their unique identifier',
        headers: {
          'Authorization': 'Bearer {{authToken}}'
        },
        event: [
          {
            listen: 'test',
            script: {
              type: 'text/javascript',
              exec: [
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});'
              ]
            }
          }
        ]
      })
    })
  ],

  postman: new PostmanForRoutes({
    folderName: 'User Management',
    description: 'Endpoints for managing user accounts',
    variable: [
      {
        key: 'authToken',
        value: '',
        type: 'string',
        description: 'Authentication token for API requests'
      }
    ]
  })
});
```

## Path Parameter Conversion

The library automatically converts Express-style path parameters to Postman variables:

- Express: `/users/:userId/posts/:postId`
- Postman: `/users/{{userId}}/posts/{{postId}}`

These parameters will be available as variables in your Postman collection.

## Best Practices

1. **Always provide sample responses** - Help API consumers understand expected outputs
2. **Include test scripts** - Validate responses automatically
3. **Use variables** - Make collections reusable across environments
4. **Document headers** - Especially authentication requirements
5. **Provide multiple response examples** - Show success and error cases
6. **Add descriptions** - Explain what each endpoint does and why
7. **Use meaningful names** - Override default names when needed

## Integration with Wecon

When you configure Postman for routes, Wecon will automatically generate the collection file:

```typescript
const wecon = new Wecon()
  .routes(userRoutes)
  .postman({
    name: 'My API',
    description: 'Complete API documentation',
    autoGenerate: true,
    output: {
      collection: './postman_collection.json',
      environment: './postman_environment.json'
    },
    baseUrl: 'http://localhost:3000',
    version: '1.0.0'
  })
  .build();
```

The generated collection will include all configured routes with their custom Postman settings.
