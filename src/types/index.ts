import { Handler, RequestHandler, RequestParamHandler } from "express";
import Route from "../lib/Route";
import Routes from "../lib/Routes";
import ErrorRoute from "../lib/CoreError";
import RoutesParam from "../lib/RoutesParam";
import PostmanForRoute from "../lib/PostmanForRoute";
interface Param {
  path: string;
  middleware: RequestParamHandler;
}

interface RoutesConfig {
  prefix?: string;
  routes: Array<Route | Routes>;
  error?: ErrorRoute;
  params?: RoutesParam[];
  middlewares?: Handler[];
  mergeParams?: boolean;
  postman?: {
    folderName: string;
  };
  module?: string;
}


interface RouteConfig {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  middlewares: Handler[] | RequestHandler[] | any[];
  name?: string;
  description?: string;
  rai: string;
  roles: string[];
  postman?: PostmanForRoute;
}

interface TheLastMiddlewareConfig {
  rootRoutes: Routes;
  roles: Array<string>;
  guestRole: string;
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
  Param,
  RouteConfig,
  RoutesConfig,
  TheLastMiddlewareConfig,
  RAI,
  PossibleErrosType,
  ErrorInfoType,
  ErrorTraceType,
};
