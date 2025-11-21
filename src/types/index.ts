import { Handler, RequestHandler } from "express";
import Route from "../lib/Route";
import Routes from "../lib/Routes";
import RoutesParam from "../lib/RoutesParam";
import PostmanRoute from "../lib/PostmanRoute";
import PostmanGroup from "../lib/PostmanGroup";
import { OpenApiRouteConfig, OpenApiGroupConfig } from "./openapi.types";

interface RoutesConfig {
  prefix?: string;
  routes: Array<Route | Routes>;
  params?: RoutesParam[];
  middlewares?: Handler[];
  mergeParams?: boolean;
  postman?: PostmanGroup;
  openapi?: OpenApiGroupConfig;
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
  postman?: PostmanRoute;
  openapi?: OpenApiRouteConfig;
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
  PostmanGroupConfig,
  PostmanRouteConfig,
  PostmanCollectionConfig,
} from "./postman.types";

export * from "./openapi.types";
