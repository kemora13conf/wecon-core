/**
 * RBAC Express Framework
 *
 * A TypeScript framework for building Express.js APIs with built-in
 * role-based access control and Postman documentation generation.
 */
import TheLastMiddleware from "./lib/Wecon";
import Route from "./lib/Route";
import Routes from "./lib/Routes";
import PostmanForRoute from "./lib/PostmanForRoute";
import PostmanForRoutes from "./lib/PostmanForRoutes";
import PostmanGenerator from "./generators/PostmanGenerator";
import { RouteConfig, RoutesConfig, PostmanForRouteConfig } from "./types";
export * from "./types/postman.types";
export type { PostmanForRouteConfig };
import ConfigError from "./errors/ConfigError";
import RequestError from "./errors/RequestError";
export { TheLastMiddleware, Route, Routes, PostmanForRoute, PostmanForRoutes, PostmanGenerator, RouteConfig, RoutesConfig, ConfigError, RequestError, };
export default TheLastMiddleware;
