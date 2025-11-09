import { Handler, RequestHandler, RequestParamHandler } from "express";
import Route from "../lib/Route";
import Routes from "../lib/Routes";
import ErrorRoute from "../lib/CoreError";
import RoutesParam from "../lib/RoutesParam";
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
  postman?: {
    folderName: string;
  };
  module?: string;
}

type ContentTypeValues =
  | "application/json"
  | "application/xml"
  | "text/html"
  | "text/plain"
  | "application/x-www-form-urlencoded"
  | "multipart/form-data"
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "application/pdf"
  | "text/css"
  | "application/javascript";

type HeaderItem<K extends string = string> = {
  key: K;
  value: K extends "Content-Type" ? ContentTypeValues | string : string;
  description?: string;
};

interface RouteConfigPostman {
  headers?: Array<HeaderItem>;
  body?: Record<string, unknown>;
  params?: Array<{ key: string; value: string; description: string }>;
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
  postman?: RouteConfigPostman;
}

interface TheLastMiddlewareConfig {
  rootRoutes: Routes;
  roles: Array<string>;
  guestRole: string;
}

type RAI = string;

export type { Param, RouteConfig, RoutesConfig, TheLastMiddlewareConfig, RAI };
