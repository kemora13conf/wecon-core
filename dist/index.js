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
import PostmanForRoute from "./lib/PostmanForRoute";
import PostmanForRoutes from "./lib/PostmanForRoutes";
// Generator exports
import PostmanGenerator from "./generators/PostmanGenerator";
// Export all Postman schema types
export * from "./types/postman.types";
// Error exports
import ConfigError from "./errors/ConfigError";
import RequestError from "./errors/RequestError";
// Export everything
export { 
// Core classes
TheLastMiddleware, Route, Routes, PostmanForRoute, PostmanForRoutes, 
// Generators
PostmanGenerator, 
// Errors
ConfigError, RequestError, };
// Default export
export default TheLastMiddleware;
