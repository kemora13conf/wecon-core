/**
 * RBAC Express Framework
 *
 * A TypeScript framework for building Express.js APIs with built-in
 * role-based access control and Postman documentation generation.
 */

// Core exports
import TheLastMiddleware from "./lib/Wecon";
import Route from "./lib/Route";
import Routes from "./lib/Routes";
import PostmanRoute from "./lib/PostmanRoute";
import PostmanGroup from "./lib/PostmanGroup";

// Generator exports
import PostmanGenerator from "./generators/PostmanGenerator";

// Type exports
import { RouteConfig, RoutesConfig, PostmanRouteConfig, PostmanGroupConfig } from "./types";

// Export all Postman schema types
export * from "./types/postman.types";
export type { PostmanRouteConfig, PostmanGroupConfig };

// Error exports
import ConfigError from "./errors/ConfigError";
import RequestError from "./errors/RequestError";

// Export everything
export {
  // Core classes
  TheLastMiddleware,
  Route,
  Routes,
  PostmanRoute,
  PostmanGroup,

  // Generators
  PostmanGenerator,

  // Types
  RouteConfig,
  RoutesConfig,

  // Errors
  ConfigError,
  RequestError,
};

// Default export
export default TheLastMiddleware;
