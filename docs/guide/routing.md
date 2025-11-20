# Smart Routing

Wecon implements a sophisticated routing engine on top of Express.

## Hierarchical Structure

Routes are defined in a tree structure using the `Routes` class. This makes it easy to organize large APIs.

```typescript
const api = new Routes({
  prefix: "/api",
  routes: [
    new Routes({
      prefix: "/users",
      middlewares: [authMiddleware], // Applied to all user routes
      routes: [
        new Route({ method: "GET", path: "/", ... }), // GET /api/users
        new Route({ method: "GET", path: "/:id", ... }), // GET /api/users/:id
      ]
    })
  ]
});
```

## Specificity & Priority

Standard Express routing is sensitive to the order in which routes are defined. Wecon solves this by **sorting routes by specificity** before registering them.

1.  **Static Routes** (`/users/profile`) take precedence over **Dynamic Routes** (`/users/:id`).
2.  **Deep Routes** (`/a/b/c`) take precedence over **Shallow Routes** (`/a/b`).

This means you don't have to worry about the order of your `routes` array. Wecon ensures the most specific route always matches first.

## Parameters

You can define route parameters using the standard `:param` syntax. Wecon also provides a `RoutesParam` class for reusable parameter validation.

```typescript
import { RoutesParam } from "@wecon/core";

const userIdParam = new RoutesParam(
  "userId",
  (req, res, next, id) => {
    // Custom logic, e.g., fetch user from DB
    req.userEntity = { id, name: "John" };
    next();
  },
  {
    // Built-in validation
    pattern: /^[0-9]+$/,
    minLength: 1
  }
);

const routes = new Routes({
  prefix: "/users/:userId",
  params: [userIdParam], // Register the param handler
  routes: [...]
});
```
