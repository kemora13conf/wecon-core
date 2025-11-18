import { Request } from "express";
import Route from "../lib/Route";
import { RaiRoutesList } from "../utils/RaiMatcher";
/**
 * Initialize the RAI matcher with routes (call this once during app startup)
 */
export declare const initializeRaiMatcher: (raisList: RaiRoutesList) => void;
/**
 * Middleware to find the request RAI based on the request URL and method.
 * Optimized with caching and efficient route matching.
 *
 * @param {Request} req - The Express request object.
 * @param {Array<Pick<Route, "path" | "method" | "rai">>} RaisList - List of RAIs to match against.
 */
export declare const findRequestRai: (req: Request, RaisList: Array<Pick<Route, "path" | "method" | "rai">>) => string;
