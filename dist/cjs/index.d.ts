/**
 * RBAC Express Framework
 *
 * A TypeScript framework for building Express.js APIs with built-in
 * role-based access control and Postman documentation generation.
 */
import AppWrapper from "./core/AppWrapper";
import Route from "./core/Route";
import Routes from "./core/Routes";
import ErrorRoute from "./core/ErrorRoute";
import Module from "./core/Module";
import { InitializeCreatingRAIs } from "./lib/rais";
import { findRequestRai } from "./lib/rais/middlewares/findRequestRai";
import { isAuthorized } from "./lib/rais/middlewares/isAuthorized";
import { IRAI, IRole } from "./lib/rais/types";
import PostmanGenerator from "./generators/Postman";
import { IRoute, IRoutes, Param, AppWrapperConfig, PostmanConfig, IPostmanUrl, ModuleConfig } from "./types";
import { PostmanCollection, PostmanEnvironment, PostmanInfo, PostmanRouteItem, PostmanUrl, PostmanRequest, PostmanVariable, SaveOptions } from "./types/postman";
import { ApiRouteNotFoundError, InvalidRouteError, NotFoundRouteError, SocketAuthError, SocketIOError } from "./errors";
export { AppWrapper, Route, Routes, ErrorRoute, Module, InitializeCreatingRAIs, findRequestRai, isAuthorized, PostmanGenerator, IRoute, IRoutes, Param, AppWrapperConfig, PostmanConfig, ModuleConfig, IPostmanUrl, IRAI, IRole, PostmanCollection, PostmanEnvironment, PostmanInfo, PostmanRouteItem, PostmanUrl, PostmanRequest, PostmanVariable, SaveOptions, ApiRouteNotFoundError, InvalidRouteError, NotFoundRouteError, SocketAuthError, SocketIOError, };
export default AppWrapper;
