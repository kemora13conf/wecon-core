/**
 * RBAC Express Framework
 *
 * A TypeScript framework for building Express.js APIs with built-in
 * role-based access control and Postman documentation generation.
 */
// Core exports
import AppWrapper from "./core/AppWrapper";
import Route from "./core/Route";
import Routes from "./core/Routes";
import ErrorRoute from "./core/ErrorRoute";
import Module from "./core/Module";
// RAI system exports
import { InitializeCreatingRAIs } from "./lib/rais";
import { findRequestRai } from "./lib/rais/middlewares/findRequestRai";
import { isAuthorized } from "./lib/rais/middlewares/isAuthorized";
// Generator exports
import PostmanGenerator from "./generators/Postman";
// Error exports
import { ApiRouteNotFoundError, InvalidRouteError, NotFoundRouteError, SocketAuthError, SocketIOError, } from "./errors";
// Export everything
export { 
// Core classes
AppWrapper, Route, Routes, ErrorRoute, Module, 
// RAI system
InitializeCreatingRAIs, findRequestRai, isAuthorized, 
// Generators
PostmanGenerator, 
// Errors
ApiRouteNotFoundError, InvalidRouteError, NotFoundRouteError, SocketAuthError, SocketIOError, };
// Default export
export default AppWrapper;
