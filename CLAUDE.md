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
yarn start                  # Run with SWC loader (--loader @swc/node/esm)
yarn test                   # Run test file (tsx ./src/test.ts)

# Building
yarn clean                  # Remove dist directory
yarn build                  # Clean and compile TypeScript (ESM + CJS)
yarn prepublishOnly         # Build before publishing (auto-runs on publish)

# Linting
yarn lint                   # Run ESLint
yarn lint:fix              # Run ESLint with auto-fix

# Publishing
yarn publish:npm            # Build and publish to npm
```

**Note**: The `test` script runs `src/test.ts` which is currently used for manual testing/development. This is NOT a test suite but a development sandbox file.

## Current Development State

The framework is under active development with recent focus on improving developer experience:

- **Recent Changes** (as of latest commits):
  - Added comprehensive error handling with `BaseClass`, `ConfigError`, and stack trace capture
  - Implemented constructor-time validation for Route and Routes classes
  - Added `groupRoutesByRai()` method for RAI uniqueness validation
  - Migrated from plain objects to `PostmanForRoutes` class for Postman configuration
  - Refactored error directory structure (`errors.ts` → `errors/` directory)

- **Work Branch**: Currently on `dev` branch (main branch is `master`)
- **Package Version**: 0.0.1 (early development)
- **Node Version Requirement**: >=18.0.0

## Architecture

### Core Structure

The framework uses a hierarchical architecture built around these main classes:

- **BaseClass**: Abstract base class providing error tracking and stack trace utilities
- **AppWrapper**: Main entry point that wraps Express apps and configures RBAC
- **Routes**: Groups of routes with shared prefixes, middleware, and organization
- **Route**: Individual API endpoints with RBAC configuration
- **Module**: Logical grouping for route organization
- **ErrorRoute**: Custom error handling for route groups
- **PostmanForRoutes**: Configuration class for Postman folder generation

### Key Directories

```
src/
├── lib/              # Core framework classes (Route, Routes, BaseClass, etc.)
├── middlewares/      # RBAC middleware (findRequestRai, isAuthorized)
├── types/            # TypeScript type definitions
├── generators/       # Postman documentation generation
├── errors/           # Custom error classes (ConfigError, etc.)
└── utils/            # Utility functions
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

### RAI Mapping with `groupRoutesByRai()`

The `Routes.groupRoutesByRai()` method builds a complete map of all RAIs in the route hierarchy:

1. **Tree Building**: Creates a tree structure representing all route paths from root to leaf
2. **Tree Expansion**: Recursively expands nested `Routes` instances until only `Route` instances remain
3. **Path Construction**: Builds full paths by concatenating prefixes from all parent `Routes`
4. **Params Collection**: Gathers all params from parent `Routes` instances for inheritance
5. **Middleware Collection**: Collects all middleware from parent `Routes` instances
6. **Uniqueness Check**: Throws error if duplicate RAI is detected, showing both conflicting paths
7. **Extended Routes**: Creates extended route objects with full path, inherited params, and middleware

This method is critical for:
- Validating RAI uniqueness across the entire application
- Understanding the complete route hierarchy
- Debugging route configuration issues

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
- Test the `groupRoutesByRai()` method for proper RAI mapping and duplicate detection
- Test constructor validation for both Route and Routes classes

## Development Patterns

### Adding New Error Types

When adding validation to Route or Routes:

1. Add error code constant (e.g., `"ROUTES_CONFIG:NEW_ERROR"`)
2. Define error info in the `POSSIBLE_ERRORS` or `errorMessages` object with:
   - `title`: Short description of what's wrong
   - `details`: Detailed explanation including actual vs expected values
   - `fix`: Code example showing how to fix the issue
3. Throw `ConfigError` (Routes) or `Error` (Route) with the error code
4. The base class will automatically capture stack trace and display formatted error

### Working with the Error System

- Route class uses plain `Error` objects with custom messages
- Routes class uses `ConfigError` from `src/errors/ConfigError.ts`
- Both rely on `BaseClass.logError()` for consistent error formatting
- All configuration errors exit the process (fail-fast approach for better DX)

## Error Handling System

The framework has a sophisticated error handling system for better developer experience:

### BaseClass Error Utilities

Both `Route` and `Routes` extend `BaseClass`, which provides:

- **`getCallerInfo()`**: Captures stack trace to identify where instances were created (file, line, column)
- **`logError()`**: Displays formatted, colored error messages with helpful fix suggestions in the console
- Errors during construction cause the process to exit with code 1

### ConfigError Class

Custom error class in `src/errors/ConfigError.ts` for configuration-related errors:

- Supports metadata for additional error context
- Maintains proper prototype chain for instanceof checks
- Used by Routes class for validation errors

### Constructor-Time Validation

- **Route**: Validates `method`, `path`, `rai`, `roles`, and `middlewares` type in constructor
- **Routes**: Validates `prefix` type, `routes` existence/type, `middlewares` type, and `mergeParams` type
- All validation errors include:
  - Error title and details
  - Exact file location where the instance was created
  - Helpful fix suggestions with code examples

### Error Message Pattern

When validation fails, developers see:
```
╔══════════════════════════════════════════════════════════╗
║  Route Configuration Error                               ║
╚══════════════════════════════════════════════════════════╝

✖ Error: Missing required 'rai' property
  Details: The Route instance requires a unique 'rai' to be defined
  Location: /path/to/file.ts:42:15
  💡 How to fix:
  Add a rai to your route configuration:
    rai: 'users:read' // Must be unique across all routes
```

## Important Implementation Details

- Routes validate all required fields (method, path, RAI, roles) in constructor with immediate feedback
- RAI uniqueness is validated via `groupRoutesByRai()` method which builds a map of all RAIs
- Path parameters are automatically converted to Postman variables (`:id` → `{{id}}`)
- Custom error handling works through ErrorRoute middleware registration
- The framework supports both flat and nested route structures
- All routes must be wrapped in Routes instances, even single routes
- `Module` class allows logical grouping of routes with metadata (optional feature)
- Route and Routes both support generic types for custom module type safety
- Constructor validation happens immediately when Route/Routes instances are created
- Params can be defined at Routes level and are inherited by nested routes via `groupRoutesByRai()`
- Error handlers are registered before routes in the middleware stack
- `PostmanForRoutes` class wraps postman configuration (replaces plain objects)
