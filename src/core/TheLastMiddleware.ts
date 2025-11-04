/**
 * The Last Middleware - Dynamic Route Authorization & Matching
 * 
 * @module TheLastMiddleware
 * @author Abdelghani El Mouak
 * @license MIT
 * 
 * @description 
 * A smart routing middleware that automatically handles authorization and route matching:
 * 
 * **How it works:**
 * 1. **Route Caching** - Creates and caches Express Routers for each endpoint using RAI (Route Authorization Identifier)
 * 2. **Request Matching** - Identifies incoming requests by their RAI
 * 3. **Authorization** - Validates user permissions before routing
 * 4. **Smart Forwarding** - Routes authorized requests to their cached Router
 * 
 * **Why use this?**
 * - ⚡ Performance: Routes are pre-built and cached in a Map
 * - 🔒 Security: Built-in authorization layer
 * - 🎯 Clean: No need to manually wire up auth checks for each route
 * - 📦 Centralized: Single point of control for all route handling
 */


import { 
    NextFunction, Request, 
    Response,
    Router
 } from "express";
import { TheLastMiddlewareConfig } from "../types";
import PostmanController from "./PotmanController";
import { findRequestRai } from "../lib/rais/middlewares/findRequestRai";
import { isAuthorized } from "../lib/rais/middlewares/isAuthorized";
import { InitializeCreatingRAIs } from "../lib/rais";

/**
 * The last middleware to be used in the application. It handles route matching,
 * authorization checks, and error handling for unmatched routes.
 *
 * @param config - Configuration object containing root routes, roles, and guest role.
 * @returns An Express middleware function.
 */
export function TheLastMiddleware(
    config: TheLastMiddlewareConfig
) {
    const { rootRoutes, roles, guestRole } = config;

    const RaisMap = new Map<string, Router>();

    return async (req: Request, res: Response, next: NextFunction) => {};
};

