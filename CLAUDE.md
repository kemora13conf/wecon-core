# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**@wecon/core** is a TypeScript framework for building Express.js APIs with built-in role-based access control (RBAC) and automatic Postman documentation generation. This is a published npm package that provides:

- Role-based access control with Resource Access Identifiers (RAIs)
- Hierarchical route organization with shared middleware
- Automatic Postman collection and environment generation
- Full TypeScript support with Express.js integration

## Development Commands

```bash
# Development
yarn dev                    # Start development server with nodemon
yarn start                  # Run with SWC loader

# Building
yarn clean                  # Remove dist directory
yarn build                  # Clean and compile TypeScript
yarn prepublishOnly         # Build before publishing (auto-runs on publish)

# Linting
yarn lint                   # Run ESLint
yarn lint:fix              # Run ESLint with auto-fix

# Publishing
yarn publish:npm            # Build and publish to npm
```

## Architecture

### Core Structure

The framework uses a hierarchical architecture built around these main classes:

- **AppWrapper**: Main entry point that wraps Express apps and configures RBAC
- **Routes**: Groups of routes with shared prefixes, middleware, and organization
- **Route**: Individual API endpoints with RBAC configuration
- **Module**: Logical grouping for route organization
- **ErrorRoute**: Custom error handling for route groups

### Key Directories

```
src/
├── core/           # Core framework classes (AppWrapper, Route, Routes, etc.)
├── lib/rais/       # Role Access Identifier system and middleware
├── types/          # TypeScript type definitions
├── generators/     # Postman documentation generation
└── errors.ts       # Custom error classes
```

### RBAC System (RAI)

Routes use Resource Access Identifiers (RAIs) for access control:

- Each route has an RAI string (e.g., "users:read", "products:create")
- Routes specify which roles can access them
- Built-in middleware (`findRequestRai`, `isAuthorized`) handles authorization
- RAIs are automatically collected and stored in `app.locals.rais`

### Route Building

Routes are built in this flow:

1. `AppWrapper.getExpressApp()` initializes RAIs and applies middleware
2. `InitializeCreatingRAIs()` extracts all RAIs and roles from the route hierarchy
3. RAI data is stored in `app.locals.rais` and `app.locals.roles` for middleware access
4. Global RBAC middleware (`findRequestRai`, `isAuthorized`) is registered first
5. `Routes.buildRouter()` recursively builds Express routers with nested route support
6. `Route.buildRoute()` registers individual endpoints with validation
7. Middleware execution order:
   - Global RBAC middleware (applied to all routes)
   - Pre-route middleware (from `getExpressApp()` middlewares param)
   - Routes group middleware (shared across route groups)
   - Route-specific middleware (individual route handlers)
   - Post-route middleware (from `getExpressApp()` postMiddlewares param)

### Postman Generation

The framework automatically generates Postman documentation:

- `PostmanGenerator` creates collections and environments
- Routes provide example bodies, parameters, and headers
- Supports multiple content types (JSON, form-data, urlencoded, text/plain)
- Content-Type header determines body format in generated collection
- Path parameters are automatically converted (`:id` → `{{id}}`)
- All Postman variables are automatically extracted and added to environment file
- Routes are numbered sequentially in the collection for easier navigation
- `PostmanController` extends `PostmanGenerator` and is used by `AppWrapper`

## Build Configuration

- **TypeScript**: Targets ES2020, outputs to `dist/` with declarations
- **Dual Module System**: Builds both ESM (`dist/`) and CommonJS (`dist/cjs/`) outputs
  - Main ESM build: `tsc` using `tsconfig.json`
  - CJS build: `tsc -p tsconfig.cjs.json` extending main config with `module: "commonjs"`
  - CJS package marker: Automatically adds `package.json` with `"type": "commonjs"` to `dist/cjs/`
  - Package exports configured for both systems in root `package.json`
- **Compilation**: Standard TypeScript compilation, no bundling
- **SWC**: Used for development server with fast transpilation

## Type Safety

The codebase uses strict TypeScript settings:

- All routes must have RAI and roles defined
- Middleware arrays are type-checked as Express handlers
- Comprehensive interfaces for all configuration objects
- Generic support for custom module types

## Testing Notes

No test framework is currently configured. When adding tests:

- Check existing patterns in similar Express.js projects
- Consider testing route building, RBAC middleware, and Postman generation
- Mock Express request/response objects for unit testing

## Important Implementation Details

- Routes validate all required fields (method, path, RAI, roles) in constructor
- Path parameters are automatically converted to Postman variables (`:id` → `{{id}}`)
- Custom error handling works through ErrorRoute middleware registration
- The framework supports both flat and nested route structures
- All routes must be wrapped in Routes instances, even single routes
- `Module` class allows logical grouping of routes with metadata (optional feature)
- Route and Routes both support generic types for custom module type safety
- Middleware validation happens at route build time, not construction time
- Params can be defined at Routes level and are inherited by nested routes
- Error handlers are registered before routes in the middleware stack
