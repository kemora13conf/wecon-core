import { Handler, RequestHandler } from "express";
import Route from "../lib/Route";
import Routes from "../lib/Routes";
import RoutesParam from "../lib/RoutesParam";
import PostmanForRoute from "../lib/PostmanForRoute";
import PostmanForRoutes from "../lib/PostmanForRoutes";

interface RoutesConfig {
  prefix?: string;
  routes: Array<Route | Routes>;
  params?: RoutesParam[];
  middlewares?: Handler[];
  mergeParams?: boolean;
  postman?: PostmanForRoutes;
  module?: string;
}

interface RouteConfig {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  middlewares: Handler[] | RequestHandler[] | any[];
  name?: string;
  description?: string;
  rai: RAI;
  roles: string[];
  postman?: PostmanForRoute;
}

interface TheLastMiddlewareConfig {
  rootRoutes: Routes;
  roles: Array<string>;
  guestRole: string;
  onRoutesPrepared?: (routes: Array<Route>) => Promise<void> | void;
}

type RAI = string;

/**
 * Error types
 */
type ErrorInfoType = {
  title: string;
  details: string;
  fix: string;
};
type PossibleErrosType = Record<string, ErrorInfoType>;
type ErrorTraceType = {
  file: string;
  line: number;
  column: number;
  function?: string | null;
};

export type {
  RouteConfig,
  RoutesConfig,
  TheLastMiddlewareConfig,
  RAI,
  PossibleErrosType,
  ErrorInfoType,
  ErrorTraceType,
};

// Re-export Postman types for convenience
export type {
  PostmanDescription,
  PostmanVersion,
  PostmanInfo,
  PostmanAuthAttribute,
  PostmanAuthType,
  PostmanAuth,
  PostmanVariableType,
  PostmanVariable,
  PostmanVariableList,
  PostmanScript,
  PostmanEvent,
  PostmanEventList,
  PostmanProtocolProfileBehavior,
  PostmanForRoutesConfig,
  PostmanCollectionConfig,
} from "./postman.types";
