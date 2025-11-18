/**
 * RBAC Express Framework
 *
 * A TypeScript framework for building Express.js APIs with built-in
 * role-based access control and Postman documentation generation.
 */
import TheLastMiddleware from "./lib/TheLastMiddleware";
import Route from "./lib/Route";
import Routes from "./lib/Routes";
import PostmanForRoute from "./lib/PostmanForRoute";
import PostmanForRoutes from "./lib/PostmanForRoutes";
import { RouteConfig, RoutesConfig } from "./types";
export * from "./types/postman.types";
import ConfigError from "./errors/ConfigError";
import RequestError from "./errors/RequestError";
export { TheLastMiddleware, Route, Routes, PostmanForRoute, PostmanForRoutes, RouteConfig, RoutesConfig, ConfigError, RequestError, };
export default TheLastMiddleware;
