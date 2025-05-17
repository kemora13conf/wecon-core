import { Router, Handler } from "express";
import { IRoute } from "../types";
import { PostmanRouteItem } from "../types/postman";
import Routes from "./Routes";
declare class Route {
    id: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    middlewares: Handler[];
    name: string;
    description: string;
    rai: string;
    roles: string[];
    postman?: {
        body?: Record<string, unknown>;
        params?: Array<{
            key: string;
            value: string;
            description: string;
        }>;
    };
    constructor(r: IRoute);
    buildRoute(router: Router, route: Routes, prefix: {
        path: string;
    }): void;
    /**
     * This function is used to generate the route for postman collection (route = request)
     */
    generateRoute(pathPrefix?: string): PostmanRouteItem;
}
export default Route;
