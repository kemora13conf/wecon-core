/**
 * Wecon - Express.js Framework with Built-in RBAC and Smart Routing
 *
 * @module Wecon
 * @author Abdelghani El Mouak
 * @license MIT
 *
 * @description
 * A fluent API for building Express.js applications with automatic authorization and route matching:
 *
 * **How it works:**
 * 1. **Route Caching** - Pre-compiles and caches Express Routers for each endpoint using RAI
 * 2. **Request Matching** - Identifies incoming requests by their RAI
 * 3. **Authorization** - Validates user permissions before routing
 * 4. **Smart Forwarding** - Routes authorized requests to their cached Router
 *
 * **Usage:**
 * ```typescript
 * const wecon = new Wecon()
 *   .routes(myRoutes)
 *   .roles(['admin', 'user', 'guest'])
 *   .guestRole('guest')
 *   .build();
 *
 * app.use(wecon);
 * ```
 *
 * **Why use Wecon?**
 * - ⚡ Performance: Routes are pre-built and cached in a Map
 * - 🔒 Security: Built-in authorization layer
 * - 🎯 Clean: Fluent API for easy configuration
 * - 📦 Centralized: Single point of control for all route handling
 * - 📝 Documentation: Automatic Postman collection generation
 */

import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from "express";
import { RAI } from "../types";
import Routes from "./Routes";
import Route from "./Route";
import errors from "../errors";
import RaiMatcher from "../utils/RaiMatcher";
import PostmanGenerator from "../generators/PostmanGenerator";

/**
 * Postman configuration interface
 */
export interface WeconPostmanConfig {
  /** Name of the Postman collection */
  name: string;
  /** Description of the API */
  description?: string;
  /** Base URL for all requests */
  baseUrl?: string;
  /** API version */
  version?: string;
  /** Output file paths */
  output?: {
    /** Path to save the collection JSON file */
    collection?: string;
    /** Path to save the environment JSON file */
    environment?: string;
  };
  /** Auto-generate on build */
  autoGenerate?: boolean;
}

/**
 * Development mode configuration
 */
export interface WeconDevConfig {
  /** Enable debug mode with verbose logging */
  debugMode?: boolean;
  /** Provide helpful error suggestions */
  helpfulErrors?: boolean;
  /** Log registered routes on startup */
  logRoutes?: boolean;
}

/**
 * Main Wecon class with fluent API
 */
class Wecon {
  private _routes?: Routes;
  private _roles: string[] = [];
  private _guestRole: string = "guest";
  private _postman?: WeconPostmanConfig;
  private _onRoutesPrepared?: (routes: Route[]) => void | Promise<void>;
  private _dev?: WeconDevConfig;

  // Rai matching
  private _raiMatcher?: RaiMatcher;

  // Express Router
  private _masterRouter?: Router;

  // Internal state after build
  private _built: boolean = false;
  private _raisMap?: Map<RAI, Route>;
  private _routerMap?: Map<RAI, Router>;
  private _middleware?: RequestHandler;

  constructor() {
    // Empty constructor for fluent API
  }

  /**
   * Set the root routes for the application
   * @param routes - Routes instance containing all application routes
   * @returns this for method chaining
   */
  public routes(routes: Routes): this {
    if (this._built) {
      throw new Error("Cannot modify Wecon after build() has been called");
    }
    if (!(routes instanceof Routes)) {
      throw new Error("routes() must receive an instance of the Routes class");
    }
    this._routes = routes;
    return this;
  }

  /**
   * Set the available roles for the application
   * @param roles - Array of role names
   * @returns this for method chaining
   */
  public roles(roles: string[]): this {
    if (this._built) {
      throw new Error("Cannot modify Wecon after build() has been called");
    }
    if (!Array.isArray(roles)) {
      throw new Error("roles() must receive an array of strings");
    }
    this._roles = roles;
    return this;
  }

  /**
   * Set the guest role (default role for unauthenticated users)
   * @param guestRole - Name of the guest role
   * @returns this for method chaining
   */
  public guestRole(guestRole: string): this {
    if (this._built) {
      throw new Error("Cannot modify Wecon after build() has been called");
    }
    if (typeof guestRole !== "string") {
      throw new Error("guestRole() must receive a string");
    }
    this._guestRole = guestRole;
    return this;
  }

  /**
   * Configure Postman collection generation
   * @param config - Postman configuration object
   * @returns this for method chaining
   */
  public postman(config: WeconPostmanConfig): this {
    if (this._built) {
      throw new Error("Cannot modify Wecon after build() has been called");
    }
    this._postman = config;
    return this;
  }

  /**
   * Set a callback to execute when routes are prepared
   * @param callback - Function to call with prepared routes
   * @returns this for method chaining
   */
  public onRoutesPrepared(
    callback: (routes: Route[]) => void | Promise<void>
  ): this {
    if (this._built) {
      throw new Error("Cannot modify Wecon after build() has been called");
    }
    if (typeof callback !== "function") {
      throw new Error("onRoutesPrepared() must receive a function");
    }
    this._onRoutesPrepared = callback;
    return this;
  }

  /**
   * Configure development mode options
   * @param config - Development configuration
   * @returns this for method chaining
   */
  public dev(config: WeconDevConfig): this {
    if (this._built) {
      throw new Error("Cannot modify Wecon after build() has been called");
    }
    this._dev = config;
    return this;
  }

  /**
   * Build and compile all routes into the middleware
   * This must be called before using the Wecon instance
   * @returns this for method chaining (allows app.use(wecon.build()))
   */
  public build(): this {
    if (this._built) throw new Error("build() can only be called once");
    if (!this._routes)
      throw new Error("routes() must be called before build()");
    if (this._roles.length === 0) throw new Error("roles() missing");

    this._built = true;
    this._raisMap = this._routes.groupRoutesByRai();

    // 1. Initialize RAI Matcher (For Security & Lookup)
    const routesList = Array.from(this._raisMap.values()).map((r) => ({
      path: r.path,
      method: r.method,
      rai: r.rai,
    }));
    this._raiMatcher = new RaiMatcher(routesList);

    // 2. Initialize ONE Master Router (For Performance)
    this._masterRouter = Router({ mergeParams: true });

    /**
     * 3. Sort routes by specificity (static before dynamic)
     * This ensures that more specific routes are matched first.
     *
     * For example:
     * - /users/list (static) should come before /users/:id (dynamic)
     * - /products/electronics/phones (static) should come before /products/:category/:item (dynamic)
     */
    const sortedRoutes = Array.from(this._raisMap.values()).sort(
      this.compareRoutes
    );

    // 4. Compile all routes into the Master Router
    sortedRoutes.forEach((route) => {
      // A. Handle Params (using router.param)
      // Since we are on one router, we must be careful.
      // However, since we use absolute paths in route.path,
      // Express handles the param matching correctly.
      route.params?.forEach((param) => {
        // We register the param middleware globally on this router.
        // Express is smart enough to only run it if the route matches.
        this._masterRouter!.param(param.path, param.middleware);

        // Validation Injection (if you have validation logic in RoutesParam)
        if (param.validate) {
          this._masterRouter!.param(param.path, (req, res, next, val) => {
            if (!param.validateValue(val)) {
              // Throw 400 or custom error
              return next(
                new errors.RequestError("Invalid Parameter", {
                  code: "INVALID_PARAM",
                })
              );
            }
            next();
          });
        }
      });

      // B. Register the Route
      // We DO NOT add Auth middleware here. We handle Auth in the global middleware below.
      // This keeps the router clean and allows the RaiMatcher to handle 403s with better error messages.
      switch (route.method) {
        case "GET":
          this._masterRouter!.get(route.path, ...route.middlewares);
          break;
        case "POST":
          this._masterRouter!.post(route.path, ...route.middlewares);
          break;
        case "PUT":
          this._masterRouter!.put(route.path, ...route.middlewares);
          break;
        case "DELETE":
          this._masterRouter!.delete(route.path, ...route.middlewares);
          break;
      }
    });

    // 4. Create the intelligent entry point
    this._middleware = this.createMiddleware();

    // 5. Call onRoutesPrepared callback if provided
    if (this._onRoutesPrepared) {
      const result = this._onRoutesPrepared(sortedRoutes);
      if (result instanceof Promise) {
        result.catch((err) => {
          console.error("Error in onRoutesPrepared callback:", err);
        });
      }
    }

    // 6. Generate Postman collection if configured
    if (this._postman?.autoGenerate) {
      this.generatePostman().catch((err) => {
        console.error("Error generating Postman collection:", err);
      });
    }

    return this;
  }

  /**
   * Comparator function to sort routes by specificity.
   * Ensures specific paths (static) come before dynamic paths (params).
   *
   * Priority order:
   * 1. Routes with fewer parameters (more static segments)
   * 2. Routes with greater length (deeper nesting)
   */
  private compareRoutes(a: Route, b: Route): number {
    // Split paths into segments
    const aSegments = a.path.split("/").filter(Boolean);
    const bSegments = b.path.split("/").filter(Boolean);
    const len = Math.max(aSegments.length, bSegments.length);

    for (let i = 0; i < len; i++) {
      const segA = aSegments[i];
      const segB = bSegments[i];

      // If one path is shorter than the other
      if (segA === undefined) return 1; // Short paths usually generic, push down? No, usually /users vs /users/list.
      // Actually, /users is handled differently. Let's focus on collision.
      if (segB === undefined) return -1;

      const aIsDynamic = segA.startsWith(":");
      const bIsDynamic = segB.startsWith(":");

      // Collision detected at this segment
      if (aIsDynamic && !bIsDynamic) {
        return 1; // A is dynamic (wildcard), B is static. B comes first.
      }
      if (!aIsDynamic && bIsDynamic) {
        return -1; // A is static, B is dynamic. A comes first.
      }
    }

    // If structure is same, sort by length (descending) purely for stability
    return b.path.length - a.path.length;
  }

  /**
   * Create the main Express middleware function
   * @private
   */
  private createMiddleware(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // --- STEP 1: INTELLIGENCE LAYER (RaiMatcher) ---
        // This layer provides the "Helpful Errors" and "Security Checks"
        // but does NOT execute the route logic.

        // Use req.path to ignore query strings and handle mounting correctly
        const path = req.path;
        const reqRai = this._raiMatcher!.findRai(path, req.method);

        // 1.1 Check 404 (Not Found)
        if (!reqRai) {
          const errorPath = req.originalUrl.split("?")[0];
          res.status(404);
          return next(
            new errors.RequestError(
              this._dev?.helpfulErrors
                ? this.createHelpfulNotFoundError(errorPath, req.method)
                : `Route not found`,
              { code: "RAI_NOT_FOUND" }
            )
          );
        }

        // 1.2 Check 403 (Authorization)
        const route = this._raisMap!.get(reqRai)!;
        const user = req.user; // Ensure you have types for this
        const user_roles: string[] = user?.roles || [this._guestRole];

        if (!route.isAuthorized(user_roles)) {
          res.status(
            user_roles.includes(this._guestRole) && user_roles.length === 1
              ? 401
              : 403
          );
          return next(
            new errors.RequestError(
              this._dev?.helpfulErrors
                ? this.createHelpfulUnauthorizedError(route, user_roles)
                : `Unauthorized`,
              { code: "UNAUTHORIZED" }
            )
          );
        }

        // --- STEP 2: EXECUTION LAYER (Express Router) ---
        // If we pass checks, we hand off to standard Express routing.
        // This is extremely efficient because we reuse one router instance.
        return this._masterRouter!(req, res, next);
      } catch (error) {
        return next(error);
      }
    };
  }

  /**
   * Create a helpful error message for 404 errors
   * @private
   */
  private createHelpfulNotFoundError(path: string, method: string): string {
    const availableRoutes = Array.from(this._raisMap!.values())
      .filter((r) => r.method === method)
      .map((r) => r.path);

    let message = `No route found for ${method} ${path}`;

    if (availableRoutes.length > 0) {
      message += `\n\nAvailable ${method} routes:\n`;
      availableRoutes.forEach((route) => {
        message += `  - ${route}\n`;
      });
    }

    return message;
  }

  /**
   * Create a helpful error message for authorization errors
   * @private
   */
  private createHelpfulUnauthorizedError(
    route: Route,
    userRoles: string[]
  ): string {
    const isGuest = userRoles.length === 1 && userRoles[0] === this._guestRole;

    if (isGuest) {
      return `Authentication required to access ${route.method} ${
        route.path
      }\n\nThis route requires one of the following roles: ${route.roles.join(
        ", "
      )}`;
    }

    return `Insufficient permissions to access ${route.method} ${
      route.path
    }\n\nRequired roles: ${route.roles.join(
      ", "
    )}\nYour roles: ${userRoles.join(", ")}`;
  }

  /**
   * Generate Postman collection and environment files
   * @returns Promise that resolves when generation is complete
   */
  public async generatePostman(): Promise<void> {
    if (!this._postman) {
      throw new Error(
        "Postman configuration not provided. Call postman() before generatePostman()"
      );
    }

    if (!this._built) {
      throw new Error(
        "Cannot generate Postman collection before build() is called"
      );
    }

    if (!this._routes) {
      throw new Error(
        "Routes not configured. Cannot generate Postman collection."
      );
    }

    try {
      const { collection, environment } = await PostmanGenerator.generateFromWecon(
        {
          name: this._postman.name,
          description: this._postman.description,
          baseUrl: this._postman.baseUrl,
          version: this._postman.version,
          output: this._postman.output,
        },
        this._routes
      );

      if (this._dev?.logRoutes) {
        console.log(`✓ Generated Postman collection: ${this._postman.name}`);
        console.log(`  - ${collection.item.length} top-level items`);
        console.log(`  - ${environment.values.length} environment variables`);
      }
    } catch (error) {
      console.error("Failed to generate Postman collection:", error);
      throw error;
    }
  }

  /**
   * Get all registered routes
   * @returns Array of all routes
   */
  public getRoutes(): Route[] {
    if (!this._built) {
      throw new Error("Cannot get routes before build() is called");
    }
    return Array.from(this._raisMap!.values());
  }

  /**
   * Get a specific route by RAI
   * @param rai - Route Access Identifier
   * @returns Route or undefined if not found
   */
  public getRoute(rai: RAI): Route | undefined {
    if (!this._built) {
      throw new Error("Cannot get route before build() is called");
    }
    return this._raisMap!.get(rai);
  }

  /**
   * Get the Express middleware function
   * This allows using the Wecon instance directly with app.use()
   *
   * @returns Express middleware function
   */
  public handler(): RequestHandler {
    if (!this._built) {
      throw new Error(
        "Cannot get handler before build() is called. Make sure to call build() first."
      );
    }
    return this._middleware!;
  }
}

export default Wecon;
