# Core Concepts

Understanding the building blocks of Wecon will help you structure your application effectively.

## Wecon Class

The `Wecon` class is the orchestrator. It takes your configuration and compiles it into a highly optimized Express middleware.

*   **Builder Pattern**: Uses a fluent API (`.routes()`, `.roles()`, `.build()`) for clear configuration.
*   **Single Middleware**: Compiles everything into one `handler()` to keep your Express app clean.
*   **Smart Matching**: Uses an internal `RaiMatcher` to find routes, allowing it to handle 404s and 403s *before* executing any route logic.

## Routes & Route

Wecon separates the concept of a **Group** of routes from a single **Endpoint**.

### `Routes` (The Group)
Represents a folder or a collection of endpoints.
*   Can have a `prefix` (e.g., `/users`).
*   Can have shared `middlewares` that apply to all children.
*   Can contain other `Routes` instances (nesting).
*   Maps to a **Folder** in Postman.

### `Route` (The Endpoint)
Represents a single HTTP endpoint.
*   Has a `method` and `path`.
*   **RAI (Resource Access Identifier)**: A unique string ID for the route (e.g., `users:create`). This is used for RBAC and internal lookups.
*   **Roles**: An array of role names allowed to access this endpoint.
*   Maps to a **Request** in Postman.

## RAI (Resource Access Identifier)

The RAI is central to Wecon's security model. Instead of checking paths (which can change), Wecon checks permissions against the RAI.

*   **Uniqueness**: Every route must have a unique RAI. Wecon enforces this at build time.
*   **Stability**: You can change the URL path of a route without breaking your permission system, as long as the RAI stays the same.

## Postman Integration

Wecon treats documentation as code. By adding `postman` configuration to your `Route` and `Routes` objects, you define exactly how your API appears in Postman.

*   **PostmanGroup**: Configures folders (descriptions, scripts).
*   **PostmanRoute**: Configures requests (examples, body, headers, tests).
