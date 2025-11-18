import { Handler, RequestHandler } from "express";
import { RouteConfig, RAI } from "../types";
import BaseClass from "./BaseClass";
import PostmanForRoute from "./PostmanForRoute";
import RoutesParam from "./RoutesParam";
declare class Route extends BaseClass {
    id: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    params?: Array<RoutesParam>;
    middlewares: Handler[] | RequestHandler[] | any[];
    name: string;
    description: string;
    rai: RAI;
    roles: string[];
    postman?: PostmanForRoute;
    /**
     * Will be used to track all the registered RAIs to ensure uniqueness
     * across the entire application.
     *
     * we choosed a Map because it provides efficient O(1) time complexity for
     * lookups, insertions, and deletions, making it ideal for checking the
     * existence of RAIs quickly.
     * and also because when we clear the map we can free up memory used by the registered RAIs.
     */
    static readonly registeredRAIs: Map<string, string>;
    constructor(r: RouteConfig);
    private validateRoute;
    private handleConfigError;
    /**
     * isAuthorized - Check if the provided user roles are authorized to access this route
     * @param {string[]} userRoles - Array of roles assigned to the user
     * @returns {boolean} - Returns true if authorized, false otherwise
     */
    isAuthorized(userRoles: string[]): boolean;
}
export default Route;
