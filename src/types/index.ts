import { Express, Handler, RequestParamHandler } from "express";
import Route from "../core/Route";
import Routes from "../core/Routes";
import ErrorRoute from "../core/ErrorRoute";

interface Param {
  path: string;
  method: RequestParamHandler;
}

interface IRoutes {
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

interface IRoute {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  middlewares: Handler[];
  name?: string;
  description?: string;
  rai: string;
  roles: string[];
  postman?: {
    body: Record<string, unknown>;
    params?: Array<{ key: string; value: string; description: string }>;
  };
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

interface AppWrapperConfig {
  app: Express;
  routes: Routes;
  postman?: PostmanConfig;
  roles?: string[];
}

interface PostmanConfig {
  name: string;
  description?: string;
  version?: string;
  baseUrl?: string;
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
  IRoute,
  IRoutes,
  Param,
  AppWrapperConfig,
  PostmanConfig,
  ModuleConfig,
};
