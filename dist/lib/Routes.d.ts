import { Handler } from "express";
import Route from "./Route";
import { RoutesConfig } from "../types";
import RoutesParam from "./RoutesParam";
import BaseClass from "./BaseClass";
import PostmanForRoutes from "./PostmanForRoutes";
declare class Routes extends BaseClass {
    prefix: string;
    routes: Array<Route | Routes>;
    params?: RoutesParam[];
    middlewares?: Handler[];
    mergeParams?: boolean;
    postman?: PostmanForRoutes;
    constructor(r: RoutesConfig);
    private validateRoutes;
    private handleConfigError;
    groupRoutesByRai(): Map<string, Route & {
        params: RoutesParam[];
        middlewares: Handler[];
    }>;
    private deduplicateParams;
    test(): void;
}
export default Routes;
