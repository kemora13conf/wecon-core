/**
 * RBAC Express Framework
 *
 * A TypeScript framework for building Express.js APIs with built-in
 * role-based access control and Postman documentation generation.
 */

// Core exports
import AppWrapper from "./core/TheLastMiddleware";
import Route from "./core/Route";
import Routes from "./core/Routes";
import ErrorRoute from "./core/CoreError";
import Module from "./core/Module";

// RAI system exports
import { InitializeCreatingRAIs } from "./lib/rais";
import { findRequestRai } from "./lib/rais/middlewares/findRequestRai";
import { isAuthorized } from "./lib/rais/middlewares/isAuthorized";
import { IRAI, IRole } from "./lib/rais/types";

// Generator exports
import PostmanGenerator from "./generators/Postman";

// Type exports
import {
  RouteConfig,
  RoutesConfig,
  Param,
  AppWrapperConfig,
  PostmanConfig,
  IPostmanUrl,
  ModuleConfig,
} from "./types";

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
import {
  ApiRouteNotFoundError,
  InvalidRouteError,
  NotFoundRouteError,
  SocketAuthError,
  SocketIOError,
} from "./errors";

// Export everything
export {
  // Core classes
  AppWrapper,
  Route,
  Routes,
  ErrorRoute,
  Module,

  // RAI system
  InitializeCreatingRAIs,
  findRequestRai,
  isAuthorized,

  // Generators
  PostmanGenerator,

  // Types
  RouteConfig,
  RoutesConfig,
  Param,
  AppWrapperConfig,
  PostmanConfig,
  ModuleConfig,
  IPostmanUrl,
  IRAI,
  IRole,

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
  ApiRouteNotFoundError,
  InvalidRouteError,
  NotFoundRouteError,
  SocketAuthError,
  SocketIOError,
};

// Default export
export default AppWrapper;
