# Vortex-JS/Core

[![npm version](https://img.shields.io/npm/v/@vortex-js/core.svg)](https://www.npmjs.com/package/@vortex-js/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A comprehensive TypeScript framework for building Express.js APIs with built-in role-based access control (RBAC) and automatic Postman documentation generation.

## Features

- **Role-Based Access Control**: Define granular access permissions for your API endpoints
- **Hierarchical Route Organization**: Logically group your routes with shared prefixes and middleware
- **Automatic Postman Documentation**: Generate Postman collections and environments from your routes
- **TypeScript Support**: Fully typed API for better developer experience
- **Express.js Integration**: Built on top of Express.js for easy adoption

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [AppWrapper](#appwrapper)
  - [Routes](#routes)
  - [Route](#route)
  - [ErrorRoute](#errorroute)
  - [Role Access Identifiers (RAIs)](#role-access-identifiers-rais)
  - [Postman Documentation](#postman-documentation)
- [API Reference](#api-reference)
- [Examples](#examples)
  - [Basic API with Authentication](#basic-api-with-authentication)
  - [Nested Routes](#nested-routes)
  - [Custom Error Handling](#custom-error-handling)
  - [Advanced RBAC](#advanced-rbac)
- [License](#license)

## Installation

```bash
npm install @vortex-js/core
# or
yarn add @vortex-js/core
```

## Quick Start

Here's a simple example to get you started:

```typescript
import express from "express";
import { AppWrapper, Routes, Route } from "@vortex-js/core";

// Create your Express app
const app = express();

// Define your routes
const apiRoutes = new Routes({
  prefix: "/api",
  routes: [
    new Route({
      method: "GET",
      path: "/users",
      middlewares: [
        (req, res) => {
          res.json({ users: ["John", "Jane"] });
        },
      ],
      name: "Get Users",
      description: "Retrieve a list of all users",
      rai: "users:read",
      roles: ["admin", "user"],
    }),
    new Route({
      method: "POST",
      path: "/users",
      middlewares: [
        (req, res) => {
          res.status(201).json({ message: "User created" });
        },
      ],
      name: "Create User",
      description: "Create a new user",
      rai: "users:create",
      roles: ["admin"],
    }),
  ],
});

// Create app wrapper
const appWrapper = new AppWrapper({
  app,
  routes: apiRoutes,
  roles: ["admin", "user", "guest"],
  postman: {
    name: "My API",
    description: "API documentation",
    baseUrl: "http://localhost:3000",
  },
});

// Get configured Express app
const configuredApp = appWrapper.getExpressApp();

// Generate Postman documentation
appWrapper.generatePostmanCollection("./collection.json");
appWrapper.generatePostmanEnvironment("./environment.json");

// Start the server
configuredApp.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

## Core Concepts

### AppWrapper

The `AppWrapper` is the main entry point of the framework. It wraps your Express application and provides:

- Role-based access control setup
- Route registration
- Postman documentation generation

```typescript
const appWrapper = new AppWrapper({
  app: expressApp, // Your Express application
  routes: routesInstance, // Routes configuration
  roles: ["admin", "user"], // Available roles
  postman: {
    // Optional Postman configuration
    name: "My API",
    description: "API Documentation",
    baseUrl: "http://localhost:3000",
    version: "1.0.0",
  },
});

// Get the configured Express app
const configuredApp = appWrapper.getExpressApp();
```

### Routes

The `Routes` class represents a group of routes with shared configuration:

- Common URL prefix
- Shared middleware
- Organized documentation

```typescript
const userRoutes = new Routes({
  prefix: "/users", // URL prefix for all contained routes
  routes: [route1, route2, route3], // Array of Route or Routes instances
  middlewares: [authMiddleware], // Optional shared middleware
  params: [
    {
      // Optional URL parameters
      path: "userId",
      method: (req, res, next, id) => {
        // Parameter handling logic
        next();
      },
    },
  ],
  postman: {
    // Optional Postman folder configuration
    folderName: "User Management",
  },
  error: errorRoute, // Optional error handling
});
```

### Route

The `Route` class represents an individual API endpoint:

```typescript
const getUserRoute = new Route({
  method: "GET", // HTTP method (GET, POST, PUT, DELETE)
  path: "/:id", // URL path (will be combined with Routes prefix)
  middlewares: [
    // Array of Express middleware functions
    (req, res) => {
      res.json({ user: { id: req.params.id, name: "John" } });
    },
  ],
  name: "Get User", // Name for documentation
  description: "Get user by ID", // Description for documentation
  rai: "users:read", // Resource Access Identifier
  roles: ["admin", "user"], // Roles that can access this route
  postman: {
    // Optional Postman configuration
    body: {
      // Example request body
      name: "John Doe",
      email: "john@example.com",
    },
    params: [
      {
        // Example URL parameters
        key: "id",
        value: "123",
        description: "User ID",
      },
    ],
  },
});
```

### ErrorRoute

The `ErrorRoute` class provides custom error handling for a route group:

```typescript
const customErrorHandler = new ErrorRoute({
  middleware: (err, req, res, next) => {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

const apiRoutes = new Routes({
  prefix: '/api',
  routes: [...],
  error: customErrorHandler
});
```

### Role Access Identifiers (RAIs)

Role Access Identifiers (RAIs) are unique strings that identify resources in your API. Each route has an RAI and a list of roles that can access it. The framework automatically:

1. Extracts RAIs from your routes
2. Checks if the current user's roles allow access to the requested RAI
3. Returns an appropriate error if access is denied

```typescript
// Define a route with RAI and roles
const route = new Route({
  // ...other properties
  rai: "users:update", // The resource being accessed
  roles: ["admin", "owner"], // Roles that can access this resource
});

// User authentication should set the user's roles
app.use((req, res, next) => {
  req.user = {
    roles: ["user", "owner"], // This user has 'user' and 'owner' roles
  };
  next();
});

// The framework middleware will check if the user can access the route
// In this example, the user has the 'owner' role, so access is granted
```

### Postman Documentation

The framework automatically generates Postman collections and environments from your routes:

```typescript
// Generate Postman collection
appWrapper.generatePostmanCollection("./postman/collection.json");

// Generate Postman environment
appWrapper.generatePostmanEnvironment("./postman/environment.json");
```

The generated files include:

- All routes with their methods, paths, and descriptions
- Request body examples
- URL parameters
- Environment variables

## API Reference

### AppWrapper

```typescript
class AppWrapper {
  constructor(config: AppWrapperConfig);
  getExpressApp(): Express;
  generatePostmanCollection(filePath: string): void;
  generatePostmanEnvironment(filePath: string): void;
}

interface AppWrapperConfig {
  app: Express;
  routes: Routes;
  postman?: PostmanConfig;
  roles?: string[];
}

interface PostmanConfig {
  name: string;
  description?: string;
  version?: string;
  baseUrl?: string;
}
```

### Routes

```typescript
class Routes {
  constructor(r: IRoutes);
  buildRouter(p_router?: Router, p_prefix?: { path: string }): Router;
  generateFolder(pathPrefix?: string): PostmanRouteItem[] | PostmanRouteItem;
}

interface IRoutes {
  prefix?: string;
  routes: Array<Route | Routes>;
  error?: ErrorRoute;
  params?: Param[];
  middlewares?: Handler[];
  postman?: {
    folderName: string;
  };
  module?: string;
}

interface Param {
  path: string;
  method: RequestParamHandler;
}
```

### Route

```typescript
class Route {
  constructor(r: IRoute);
  buildRoute(router: Router, route: Routes, prefix: { path: string }): void;
  generateRoute(pathPrefix?: string): PostmanRouteItem;
}

interface IRoute {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  middlewares: Handler[];
  name?: string;
  description?: string;
  rai: string;
  roles: string[];
  postman?: {
    body?: Record<string, unknown>;
    params?: Array<{ key: string; value: string; description: string }>;
  };
}
```

### ErrorRoute

```typescript
class ErrorRoute {
  constructor(r: IErrorRoute);
}

interface IErrorRoute {
  middleware: PathParams;
}
```

### RAI System

```typescript
function InitializeCreatingRAIs(RoutesInstance: Routes): {
  rais: IRAI[];
  roles: string[];
};

interface IRAI {
  method: string;
  path: string;
  _id: string;
  name: string;
  description: string;
  rai: string;
  children: string[];
  roles: string[];
  isStopped: boolean;
}

interface IRole {
  _id: string;
  name: string;
}
```

### PostmanGenerator

```typescript
class PostmanGenerator {
  constructor(
    name: string,
    description?: string,
    options?: {
      baseUrl?: string;
      version?: string;
    }
  );

  addEnvironmentVariable(key: string, value: string, type?: string): void;
  addEnvironmentVariables(
    variables: Array<{
      key: string;
      value: string;
      type?: string;
    }>
  ): void;

  generateCollection(items: PostmanRouteItem[]): PostmanCollection;
  generateEnvironment(items: PostmanRouteItem[]): PostmanEnvironment;

  saveCollectionToFile(filePath: string, options?: SaveOptions): void;
  saveEnvironmentToFile(filePath: string, options?: SaveOptions): void;
  saveToFiles(
    collectionPath: string,
    environmentPath: string,
    options?: SaveOptions
  ): void;
}
```

## Examples

### Basic API with Authentication

This example shows how to set up a basic API with JWT authentication:

```typescript
import express from "express";
import jwt from "jsonwebtoken";
import { AppWrapper, Routes, Route } from "@vortex-js/core";

const app = express();
app.use(express.json());

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, "your-secret-key");
    req.user = {
      id: decoded.id,
      roles: decoded.roles,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Login route (outside RBAC system)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Example authentication (replace with your own)
  if (username === "admin" && password === "password") {
    const token = jwt.sign({ id: 1, roles: ["admin"] }, "your-secret-key", {
      expiresIn: "1h",
    });

    return res.json({ token });
  }

  if (username === "user" && password === "password") {
    const token = jwt.sign({ id: 2, roles: ["user"] }, "your-secret-key", {
      expiresIn: "1h",
    });

    return res.json({ token });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

// RBAC routes
const apiRoutes = new Routes({
  prefix: "/api",
  routes: [
    // Public route
    new Route({
      method: "GET",
      path: "/public",
      middlewares: [
        (req, res) => {
          res.json({ message: "This is public" });
        },
      ],
      name: "Public Endpoint",
      description: "Accessible to everyone",
      rai: "public:read",
      roles: ["admin", "user", "guest"],
    }),

    // Protected routes
    new Routes({
      prefix: "/users",
      middlewares: [authenticate], // Apply authentication to all routes in this group
      routes: [
        new Route({
          method: "GET",
          path: "",
          middlewares: [
            (req, res) => {
              res.json({
                users: [
                  { id: 1, name: "Admin" },
                  { id: 2, name: "User" },
                ],
              });
            },
          ],
          name: "Get All Users",
          description: "List all users",
          rai: "users:list",
          roles: ["admin"], // Only admin can list users
        }),

        new Route({
          method: "GET",
          path: "/profile",
          middlewares: [
            (req, res) => {
              res.json({ profile: { id: req.user.id, roles: req.user.roles } });
            },
          ],
          name: "Get Profile",
          description: "Get current user profile",
          rai: "users:profile",
          roles: ["admin", "user"], // Both admin and user can access their profile
        }),
      ],
    }),
  ],
});

// Create app wrapper
const appWrapper = new AppWrapper({
  app,
  routes: apiRoutes,
  roles: ["admin", "user", "guest"],
  postman: {
    name: "Authentication Example API",
    description: "API with authentication and RBAC",
    baseUrl: "http://localhost:3000",
  },
});

// Get configured Express app
const configuredApp = appWrapper.getExpressApp();

// Generate Postman documentation
appWrapper.generatePostmanCollection("./collection.json");
appWrapper.generatePostmanEnvironment("./environment.json");

// Start the server
configuredApp.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

### Nested Routes

This example demonstrates how to organize routes in a hierarchical structure:

```typescript
import express from "express";
import { AppWrapper, Routes, Route } from "express-rbac-framework";

const app = express();
app.use(express.json());

// Define some middleware
const logRequest = (req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
};

const checkApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== "valid-key") {
    return res.status(401).json({ error: "Invalid API key" });
  }
  next();
};

// Define routes with nested structure
const apiRoutes = new Routes({
  prefix: "/api",
  middlewares: [logRequest, checkApiKey],
  postman: { folderName: "API" },
  routes: [
    // Users routes
    new Routes({
      prefix: "/users",
      postman: { folderName: "User Management" },
      routes: [
        new Route({
          method: "GET",
          path: "",
          middlewares: [(req, res) => res.json({ users: [] })],
          name: "List Users",
          description: "Get all users",
          rai: "users:list",
          roles: ["admin"],
        }),

        new Route({
          method: "POST",
          path: "",
          middlewares: [(req, res) => res.status(201).json({ id: 1 })],
          name: "Create User",
          description: "Create a new user",
          rai: "users:create",
          roles: ["admin"],
          postman: {
            body: {
              name: "John Doe",
              email: "john@example.com",
            },
          },
        }),

        // User details routes
        new Routes({
          prefix: "/:userId",
          params: [
            {
              path: "userId",
              method: (req, res, next, id) => {
                if (isNaN(parseInt(id))) {
                  return res.status(400).json({ error: "Invalid user ID" });
                }
                next();
              },
            },
          ],
          routes: [
            new Route({
              method: "GET",
              path: "",
              middlewares: [
                (req, res) => res.json({ id: req.params.userId, name: "John" }),
              ],
              name: "Get User",
              description: "Get user by ID",
              rai: "users:read",
              roles: ["admin", "user"],
            }),

            new Route({
              method: "PUT",
              path: "",
              middlewares: [(req, res) => res.json({ updated: true })],
              name: "Update User",
              description: "Update a user",
              rai: "users:update",
              roles: ["admin"],
              postman: {
                body: {
                  name: "Updated Name",
                  email: "updated@example.com",
                },
              },
            }),

            new Route({
              method: "DELETE",
              path: "",
              middlewares: [(req, res) => res.json({ deleted: true })],
              name: "Delete User",
              description: "Delete a user",
              rai: "users:delete",
              roles: ["admin"],
            }),
          ],
        }),
      ],
    }),

    // Products routes
    new Routes({
      prefix: "/products",
      postman: { folderName: "Product Management" },
      routes: [
        // Product routes here
      ],
    }),
  ],
});

const appWrapper = new AppWrapper({
  app,
  routes: apiRoutes,
  roles: ["admin", "user", "guest"],
  postman: {
    name: "Nested Routes Example",
    description: "API with hierarchical route structure",
    baseUrl: "http://localhost:3000",
  },
});

const configuredApp = appWrapper.getExpressApp();
appWrapper.generatePostmanCollection("./collection.json");

configuredApp.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

### Custom Error Handling

This example shows how to implement custom error handling:

```typescript
import express from "express";
import { AppWrapper, Routes, Route, ErrorRoute } from "@vortex-js/core";

const app = express();
app.use(express.json());

// Custom validation middleware
const validateUser = (req, res, next) => {
  const { name, email } = req.body;

  if (!name || !email) {
    const error = new Error("Name and email are required");
    error.name = "ValidationError";
    return next(error);
  }

  if (typeof name !== "string" || name.length < 3) {
    const error = new Error("Name must be at least 3 characters long");
    error.name = "ValidationError";
    return next(error);
  }

  if (!email.includes("@")) {
    const error = new Error("Invalid email format");
    error.name = "ValidationError";
    return next(error);
  }

  next();
};

// Custom error handler
const apiErrorHandler = new ErrorRoute({
  middleware: (err, req, res, next) => {
    console.error("API Error:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation Error",
        message: err.message,
      });
    }

    if (err.name === "NotFoundRouteError") {
      return res.status(404).json({
        error: "Not Found",
        message: "The requested resource does not exist",
      });
    }

    if (err.name === "ApiRouteNotFoundError") {
      return res.status(403).json({
        error: "Access Denied",
        message: "You do not have permission to access this resource",
      });
    }

    // Default error handler
    res.status(500).json({
      error: "Server Error",
      message: "An unexpected error occurred",
    });
  },
});

// Define routes
const apiRoutes = new Routes({
  prefix: "/api",
  error: apiErrorHandler, // Apply custom error handling
  routes: [
    new Routes({
      prefix: "/users",
      routes: [
        new Route({
          method: "POST",
          path: "",
          middlewares: [
            validateUser, // Apply validation
            (req, res) => {
              res.status(201).json({
                id: 1,
                name: req.body.name,
                email: req.body.email,
              });
            },
          ],
          name: "Create User",
          description: "Create a new user with validation",
          rai: "users:create",
          roles: ["admin"],
          postman: {
            body: {
              name: "John Doe",
              email: "john@example.com",
            },
          },
        }),
      ],
    }),
  ],
});

const appWrapper = new AppWrapper({
  app,
  routes: apiRoutes,
  roles: ["admin", "user", "guest"],
});

const configuredApp = appWrapper.getExpressApp();

// Global fallback error handler
configuredApp.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).send("Something went wrong!");
});

configuredApp.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

### Advanced RBAC

This example demonstrates a more complex role-based access control scenario:

```typescript
import express from "express";
import jwt from "jsonwebtoken";
import { AppWrapper, Routes, Route } from "express-rbac-framework";

const app = express();
app.use(express.json());

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    req.user = { roles: ["guest"] }; // Default guest role
    return next();
  }

  try {
    const decoded = jwt.verify(token, "your-secret-key");
    req.user = {
      id: decoded.id,
      roles: decoded.roles,
      organization: decoded.organization,
    };
    next();
  } catch (err) {
    req.user = { roles: ["guest"] }; // Default to guest on error
    next();
  }
};

// Mock database
const users = [
  { id: 1, name: "Admin", organization: "org1", isAdmin: true },
  { id: 2, name: "Manager", organization: "org1", isManager: true },
  { id: 3, name: "User 1", organization: "org1" },
  { id: 4, name: "User 2", organization: "org2" },
];

// Example of owner check middleware
const checkOwnership = (req, res, next) => {
  const userId = parseInt(req.params.userId);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // User is either admin, from same organization, or the user themselves
  const isAdmin = req.user.roles.includes("admin");
  const isSameOrg = user.organization === req.user.organization;
  const isSelf = req.user.id === userId;

  if (isAdmin || isSameOrg || isSelf) {
    req.targetUser = user;
    return next();
  }

  return res.status(403).json({ error: "Access denied" });
};

// Define routes
const apiRoutes = new Routes({
  prefix: "/api",
  middlewares: [authenticate],
  routes: [
    new Routes({
      prefix: "/users",
      routes: [
        // List all users - admin only
        new Route({
          method: "GET",
          path: "",
          middlewares: [
            (req, res) => {
              // Admins see all users
              if (req.user.roles.includes("admin")) {
                return res.json({ users });
              }

              // Managers see users in their organization
              if (req.user.roles.includes("manager")) {
                const orgUsers = users.filter(
                  (u) => u.organization === req.user.organization
                );
                return res.json({ users: orgUsers });
              }

              // Regular users see limited info
              const basicUsers = users.map((u) => ({
                id: u.id,
                name: u.name,
              }));
              return res.json({ users: basicUsers });
            },
          ],
          name: "List Users",
          description: "Get all users with role-based filtering",
          rai: "users:list",
          roles: ["admin", "manager", "user"],
        }),

        // Get specific user details - with ownership check
        new Route({
          method: "GET",
          path: "/:userId",
          middlewares: [
            checkOwnership,
            (req, res) => {
              // Admins see everything
              if (req.user.roles.includes("admin")) {
                return res.json({ user: req.targetUser });
              }

              // Others see limited info
              const { id, name, organization } = req.targetUser;
              return res.json({ user: { id, name, organization } });
            },
          ],
          name: "Get User",
          description: "Get user by ID with role-based data filtering",
          rai: "users:read",
          roles: ["admin", "manager", "user"],
        }),

        // Update user - admin or same organization manager
        new Route({
          method: "PUT",
          path: "/:userId",
          middlewares: [
            checkOwnership,
            (req, res) => {
              // Only admins can change organization
              if (req.body.organization && !req.user.roles.includes("admin")) {
                return res.status(403).json({
                  error: "Only admins can change organization",
                });
              }

              // Update user
              const userIndex = users.findIndex(
                (u) => u.id === parseInt(req.params.userId)
              );
              users[userIndex] = { ...users[userIndex], ...req.body };

              return res.json({
                message: "User updated",
                user: users[userIndex],
              });
            },
          ],
          name: "Update User",
          description: "Update user with role-based permissions",
          rai: "users:update",
          roles: ["admin", "manager"],
          postman: {
            body: {
              name: "Updated Name",
              email: "updated@example.com",
            },
          },
        }),

        // Delete user - admin only
        new Route({
          method: "DELETE",
          path: "/:userId",
          middlewares: [
            (req, res) => {
              const userId = parseInt(req.params.userId);
              const userIndex = users.findIndex((u) => u.id === userId);

              if (userIndex === -1) {
                return res.status(404).json({ error: "User not found" });
              }

              users.splice(userIndex, 1);
              return res.json({ message: "User deleted" });
            },
          ],
          name: "Delete User",
          description: "Delete a user (admin only)",
          rai: "users:delete",
          roles: ["admin"],
        }),
      ],
    }),
  ],
});

// Create app wrapper with detailed roles
const appWrapper = new AppWrapper({
  app,
  routes: apiRoutes,
  roles: ["admin", "manager", "user", "guest"],
  postman: {
    name: "Advanced RBAC Example",
    description: "API with complex role-based access control",
    baseUrl: "http://localhost:3000",
  },
});

const configuredApp = appWrapper.getExpressApp();
appWrapper.generatePostmanCollection("./collection.json");

configuredApp.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
