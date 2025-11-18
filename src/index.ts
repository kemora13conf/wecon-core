/**
 * RBAC Express Framework
 *
 * A TypeScript framework for building Express.js APIs with built-in
 * role-based access control and Postman documentation generation.
 */

// Core exports
import TheLastMiddleware  from "./lib/TheLastMiddleware";
import Route from "./lib/Route";
import Routes from "./lib/Routes";
import Module from "./lib/Module";

// Generator exports
import PostmanGenerator from "./generators/Postman";

// Type exports
import { RouteConfig, RoutesConfig } from "./types";

import {
  PostmanCollection,
  PostmanEnvironment,
  PostmanInfo,
  PostmanRouteItem,
  PostmanUrl,
  PostmanRequest,
  PostmanVariable,
  SaveOptions,
} from "./types/postman";

// Error exports
import ConfigError from "./errors/ConfigError";
import RequestError from "./errors/RequestError";

// Export everything
export {
  // Core classes
  TheLastMiddleware,
  Route,
  Routes,
  Module,

  // Generators
  PostmanGenerator,

  // Types
  RouteConfig,
  RoutesConfig,

  // Postman types
  PostmanCollection,
  PostmanEnvironment,
  PostmanInfo,
  PostmanRouteItem,
  PostmanUrl,
  PostmanRequest,
  PostmanVariable,
  SaveOptions,

  // Errors
  ConfigError,
  RequestError,
};

// Default export
export default TheLastMiddleware ;
