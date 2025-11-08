import { Handler, RequestHandler, RequestParamHandler } from "express";
import Route from "../core/Route";
import Routes from "../core/Routes";
import ErrorRoute from "../core/CoreError";
interface Param {
  path: string;
  middelware: RequestParamHandler;
}

interface RoutesConfig {
  prefix?: string;
  routes: Array<Route | Routes>;
  error?: ErrorRoute;
  params?: Param[];
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

interface IPostmanUrl {
  raw: string;
  protocol?: string;
  host: string[];
  path: string[];
  query?: Array<{
    key: string;
    value: string;
    description?: string;
  }>;
}

interface PostmanConfig {
  name: string;
  description?: string;
  version?: string;
  baseUrl?: string;
}

interface TheLastMiddlewareConfig {
  rootRoutes: Routes;
  roles: Array<string>;
  guestRole: string;
}

interface ModuleConfig {
  name: string;
  routes: Routes;
  bootstrap?: () => Promise<void> | void;
  i18n?: {
    [key: string]: Record<string, unknown>;
  };
}

export type {
  IPostmanUrl,
  RouteConfig,
  RoutesConfig,
  Param,
  TheLastMiddlewareConfig,
  PostmanConfig,
  ModuleConfig,
};
