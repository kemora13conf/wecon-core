# API Reference

## Wecon

The main configuration class.

### Methods

*   `routes(routes: Routes): this` - Set the root routes.
*   `roles(roles: string[]): this` - Define available roles.
*   `guestRole(role: string): this` - Set default guest role.
*   `postman(config: WeconPostmanConfig): this` - Configure Postman generation.
*   `dev(config: WeconDevConfig): this` - Configure dev tools.
*   `build(): this` - Compile the application.
*   `handler(): RequestHandler` - Get the Express middleware.

## Routes

Represents a group of routes.

### Config Interface

```typescript
interface RoutesConfig {
  prefix?: string;
  routes: Array<Route | Routes>;
  middlewares?: Handler[];
  params?: RoutesParam[];
  postman?: PostmanGroup;
}
```

## Route

Represents a single endpoint.

### Config Interface

```typescript
interface RouteConfig {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  middlewares: Handler[];
  name?: string;
  description?: string;
  rai: string; // Must be unique
  roles: string[];
  postman?: PostmanRoute;
}
```

## PostmanGroup

Configures a Postman folder.

### Config Interface

```typescript
interface PostmanGroupConfig {
  folderName: string;
  description?: string;
  auth?: PostmanAuth;
  variable?: PostmanVariable[];
  event?: PostmanEvent[]; // Scripts
}
```

## PostmanRoute

Configures a Postman request.

### Config Interface

```typescript
interface PostmanRouteConfig {
  name?: string;
  description?: string;
  auth?: PostmanAuth;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: {
    mode: "raw" | "urlencoded" | "formdata" | "file" | "graphql";
    raw?: string;
    // ... other body options
  };
  event?: PostmanEvent[]; // Scripts
}
```
