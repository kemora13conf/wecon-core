import { Express, Request, Response } from "express";
import { NextFunction, PathParams, RequestHandlerParams } from "express-serve-static-core";
import Route from "../core/Route";
import Routes from "../core/Routes";
import ErrorRoute from "../core/ErrorRoute";

interface Param {
    path: string;
    method: (req: Request, res: Response, next: NextFunction, id: string) => Promise<void> | void;
}

interface IRoutes {
    prefix: PathParams;
    routes: Array<Route | Routes>;
    error?: ErrorRoute;
    params?: Param[];
    middlewares?: RequestHandlerParams[];
    postman?: {
        folderName: string;
    };
    module?: string;
}

interface IRoute {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    middlewares: RequestHandlerParams[];
    name: string;
    description: string;
    rai: string;
    parents: string[];
    postman?: {
        body: Record<string, unknown>;
        params?: Array<{ key: string, value: string, description: string }>;
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
    express: Express;
    routes: Routes;
    postman?: PostmanConfig;
    security?: SecurityConfig;
}
export interface SecurityConfig {
    roles: RoleDefinition[];
    defaultRole?: string;
    unauthorized?: (req: Request, res: Response) => void;
}
export interface RoleDefinition {
    name: string;
    permissions: string[];
    inherits?: string[];
}

export interface PostmanConfig {
    name: string;
    description?: string;
    version?: string;
    baseUrl?: string;
}



export type { IPostmanUrl, IRoute, IRoutes, Param, AppWrapperConfig };