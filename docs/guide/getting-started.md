# Getting Started

## Introduction

**@wecon/core** is a comprehensive TypeScript framework designed to streamline the development of Express.js APIs. It solves common boilerplate problems like:

*   **Security**: How do I handle roles and permissions consistently?
*   **Documentation**: How do I keep my Postman collection in sync with my code?
*   **Organization**: How do I structure routes in a large application?

## Installation

Install the package using your preferred package manager:

::: code-group

```bash [npm]
npm install @wecon/core
```

```bash [yarn]
yarn add @wecon/core
```

```bash [pnpm]
pnpm add @wecon/core
```

:::

## Quick Start

Here is a minimal example to get a secure API up and running.

### 1. Define a Route

Create a `Routes` configuration. This defines your endpoints.

```typescript
import { Routes, Route } from "@wecon/core";

const apiRoutes = new Routes({
  prefix: "/api",
  routes: [
    new Route({
      method: "GET",
      path: "/hello",
      middlewares: [
        (req, res) => res.json({ message: "Hello World" })
      ],
      name: "Hello World",
      rai: "system:hello", // Unique Resource Access Identifier
      roles: ["guest", "user"], // Allowed roles
    }),
  ],
});
```

### 2. Configure Wecon

Initialize the `Wecon` instance. This builds the routing logic and security layer.

```typescript
import { Wecon } from "@wecon/core";

const wecon = new Wecon()
  .routes(apiRoutes)
  .roles(["admin", "user", "guest"]) // Define all roles
  .guestRole("guest") // Default role for unauthenticated users
  .build();
```

### 3. Integrate with Express

Mount the Wecon handler into your Express app.

```typescript
import express from "express";

const app = express();

// Optional: Authentication Middleware
// You must set req.user.roles for Wecon to know who the user is.
app.use((req, res, next) => {
  // In a real app, you would decode a JWT here
  req.user = { roles: ["guest"] }; 
  next();
});

// Mount Wecon
app.use(wecon.handler());

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

Now visit `http://localhost:3000/api/hello`!
