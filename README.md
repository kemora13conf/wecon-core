# @wecon/core

[![npm version](https://img.shields.io/npm/v/@wecon/core.svg)](https://www.npmjs.com/package/@wecon/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A comprehensive TypeScript framework for building Express.js APIs with built-in role-based access control (RBAC), smart routing, and automatic Postman documentation generation.

## Features

- **Role-Based Access Control**: Define granular access permissions for your API endpoints using RAIs (Resource Access Identifiers).
- **Smart Routing**: High-performance route matching with static/dynamic segment prioritization.
- **Hierarchical Organization**: Logically group your routes with shared prefixes and middleware.
- **Automatic Postman Documentation**: Generate production-ready Postman collections and environments with variable extraction.
- **Developer Experience**: Helpful error messages with stack traces pointing exactly to your configuration issues.
- **TypeScript Support**: Fully typed API for better developer experience.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Wecon](#wecon)
  - [Routes](#routes)
  - [Route](#route)
  - [Postman Integration](#postman-integration)
- [API Reference](#api-reference)
- [Examples](#examples)
- [License](#license)

## Installation

```bash
npm install @wecon/core
# or
yarn add @wecon/core
```

## Quick Start

Here's a simple example to get you started:

```typescript
import express from "express";
import { Wecon, Routes, Route } from "@wecon/core";

// 1. Define your routes
const apiRoutes = new Routes({
  prefix: "/api",
  routes: [
    new Route({
      method: "GET",
      path: "/users",
      middlewares: [
        (req, res) => res.json({ users: ["John", "Jane"] })
      ],
      name: "Get Users",
      description: "Retrieve a list of all users",
      rai: "users:read",
      roles: ["admin", "user"],
    }),
  ],
});

// 2. Configure Wecon
const wecon = new Wecon()
  .routes(apiRoutes)
  .roles(["admin", "user", "guest"])
  .guestRole("guest")
  .postman({
    name: "My API",
    description: "API documentation",
    baseUrl: "http://localhost:3000",
    autoGenerate: true,
    output: {
      collection: "./postman_collection.json",
      environment: "./postman_environment.json"
    }
  })
  .build();

// 3. Use with Express
const app = express();

// Optional: Add auth middleware to set req.user.roles
app.use((req, res, next) => {
  req.user = { roles: ["admin"] }; // Example auth
  next();
});

// Mount Wecon middleware
app.use(wecon.handler());

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

## Core Concepts

### Wecon

The `Wecon` class is the main entry point. It uses a fluent API to configure your application's routing and security layer.

```typescript
const wecon = new Wecon()
  .routes(myRoutes)
  .roles(['admin', 'user'])
  .guestRole('guest')
  .dev({ helpfulErrors: true }) // Enable detailed error messages
  .build();
```

### Routes

The `Routes` class represents a group of routes. It supports nesting, shared middleware, and Postman folder organization.

```typescript
import { Routes, PostmanGroup } from "@wecon/core";

const userRoutes = new Routes({
  prefix: "/users",
  middlewares: [authMiddleware], // Applied to all children
  postman: new PostmanGroup({
    folderName: "User Management",
    description: "Endpoints for managing users"
  }),
  routes: [
    // ... child Route or Routes instances
  ]
});
```

### Route

The `Route` class represents a single API endpoint. It requires a unique `rai` (Resource Access Identifier) for RBAC.

```typescript
import { Route, PostmanRoute } from "@wecon/core";

const getUser = new Route({
  method: "GET",
  path: "/:id",
  rai: "users:read", // Must be unique across the app
  roles: ["admin", "user"],
  middlewares: [getUserHandler],
  postman: new PostmanRoute({
    name: "Get User Details",
    description: "Fetches user by ID",
    // Variables like :id are automatically extracted to Postman variables
  })
});
```

### Postman Integration

Wecon treats documentation as a first-class citizen. It generates:
1. **Collections**: Full v2.1.0 collections with folders, requests, and examples.
2. **Environments**: Automatically extracts variables (like `{{baseUrl}}`, `{{userId}}`) from your route paths and configurations.

Use `PostmanGroup` for folders and `PostmanRoute` for requests to customize the output (auth, scripts, variables, etc.).

## API Reference

### Wecon Class

| Method | Description |
|--------|-------------|
| `.routes(routes: Routes)` | Set the root routes configuration. |
| `.roles(roles: string[])` | Define all available roles in the system. |
| `.guestRole(role: string)` | Set the default role for unauthenticated users (default: 'guest'). |
| `.postman(config)` | Configure Postman generation settings. |
| `.dev(config)` | Configure development options (debug mode, helpful errors). |
| `.build()` | Compile routes and prepare the middleware. Must be called before use. |
| `.handler()` | Returns the Express middleware function. |

### Routes Config

| Property | Type | Description |
|----------|------|-------------|
| `prefix` | `string` | URL prefix for this group (e.g., "/api"). |
| `routes` | `(Route \| Routes)[]` | Array of child routes or groups. |
| `middlewares` | `Handler[]` | Express middleware shared by all children. |
| `params` | `RoutesParam[]` | Route parameter handlers (e.g., for :id). |
| `postman` | `PostmanGroup` | Postman folder configuration. |

### Route Config

| Property | Type | Description |
|----------|------|-------------|
| `method` | `"GET" \| "POST" ...` | HTTP method. |
| `path` | `string` | URL path (combined with parent prefixes). |
| `rai` | `string` | **Unique** Resource Access Identifier. |
| `roles` | `string[]` | Roles allowed to access this route. |
| `middlewares` | `Handler[]` | Express handlers for this route. |
| `postman` | `PostmanRoute` | Postman request configuration. |

## Examples

### Nested Routes with Postman Configuration

```typescript
const apiRoutes = new Routes({
  prefix: "/api",
  postman: new PostmanGroup({ folderName: "API Root" }),
  routes: [
    new Routes({
      prefix: "/v1",
      postman: new PostmanGroup({ folderName: "Version 1" }),
      routes: [
        new Route({
          method: "GET",
          path: "/status",
          rai: "system:status",
          roles: ["guest"],
          middlewares: [(req, res) => res.send("OK")],
          postman: new PostmanRoute({
            name: "Check Status",
            event: [
              {
                listen: "test",
                script: {
                  exec: ["pm.test('Status is 200', () => pm.response.to.have.status(200))"]
                }
              }
            ]
          })
        })
      ]
    })
  ]
});
```

## License

This project is licensed under the MIT License.
