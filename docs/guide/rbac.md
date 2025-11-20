# Role-Based Access Control (RBAC)

Security is built into the core of Wecon. You cannot define a route without explicitly stating who can access it.

## Defining Roles

First, tell Wecon what roles exist in your system:

```typescript
const wecon = new Wecon()
  .roles(["admin", "manager", "user", "guest"])
  .guestRole("guest") // The role assumed if req.user is missing
  .build();
```

## Protecting Routes

Assign roles to each route using the `roles` property.

```typescript
new Route({
  // ...
  roles: ["admin"], // Only admins
});

new Route({
  // ...
  roles: ["admin", "manager"], // Admins OR Managers
});

new Route({
  // ...
  roles: ["guest", "user"], // Publicly accessible (if guest is default)
});
```

## How it Works

1.  **Request Arrives**: Wecon intercepts the request.
2.  **Identify User**: It looks for `req.user.roles` (an array of strings).
    *   If `req.user` is undefined, it assigns the `guestRole`.
3.  **Match Route**: It finds the matching route configuration using the URL.
4.  **Check Permissions**: It checks if there is an intersection between the user's roles and the route's allowed roles.
5.  **Decision**:
    *   **Authorized**: The request proceeds to your middlewares.
    *   **Unauthorized**: Wecon immediately returns a `403 Forbidden` (or `401 Unauthorized` for guests) with a helpful error message.

## Helpful Errors

In development mode, Wecon provides detailed error messages to help you debug permissions.

```typescript
// Enable helpful errors
.dev({ helpfulErrors: true })
```

**Example 403 Response:**
```
Insufficient permissions to access GET /api/admin/settings

Required roles: admin
Your roles: user
```
