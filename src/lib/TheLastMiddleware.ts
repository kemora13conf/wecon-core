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

import { NextFunction, Request, Response, Router } from "express";
import { RAI, TheLastMiddlewareConfig } from "../types";
import Routes from "./Routes";

/**
 * The last middleware to be used in the application. It handles route matching,
 * authorization checks, and error handling for unmatched routes.
 *
 * @param config - Configuration object containing root routes, roles, and guest role.
 * @returns An Express middleware function.
 */
export function TheLastMiddleware(config: TheLastMiddlewareConfig) {
  const { rootRoutes, roles, guestRole = "guest" } = config;

  /**
   * Validate the configuration object.
   * @throws Will throw an error if the configuration is invalid.
   */
  switch (true) {
    case !Array.isArray(rootRoutes):
      throw new Error(
        "TheLastMiddleware: 'rootRoutes' must be an array of Routes."
      );
    case !(rootRoutes instanceof Routes):
      throw new Error(
        "TheLastMiddleware: 'rootRoutes' must be an instance of the Routes class."
      );
    case !Array.isArray(roles):
      throw new Error(
        "TheLastMiddleware: 'roles' must be an array of role definitions."
      );
    case typeof guestRole !== "string":
      throw new Error(
        "TheLastMiddleware: 'guestRole' must be a string representing the guest role."
      );
  }
  
  /**
   * Group routes by their RAI for efficient lookup during request handling.
   * This creates a Map where each key is a RAI and the value is the corresponding Route.
   */
  const RaisMap = rootRoutes.groupRoutesByRai();

  /**
   * Now we have to turn each Route in the RaisMap into an Express Router
   * and store it back in the map for quick access during request handling.
   */
  const RouterMap = new Map<RAI, Router>();
  RaisMap.forEach((route, rai) => {
    const router = Router();

    // Attache all params to the router
    route.params.forEach((param) => {
      router.param(param.path, param.middleware);
    });

    // Attach all middlewares to the router
    route.middlewares.forEach((mw) => {
      router.use(mw);
    });
    // Define the route handler
    switch (route.method) {
      case "GET":
        router.get(route.path, (req: Request, res: Response) => {
          res.end();
        });
        break;
      case "POST":
        router.post(route.path, (req: Request, res: Response) => {
          res.end();
        });
        break;
      case "PUT":
        router.put(route.path, (req: Request, res: Response) => {
          res.end();
        });
        break;
      case "DELETE":
        router.delete(route.path, (req: Request, res: Response) => {
          res.end();
        });
        break;
    }
    RouterMap.set(rai, router);
  });

  return async (req: Request, res: Response, next: NextFunction) => {};
}

export default TheLastMiddleware;
