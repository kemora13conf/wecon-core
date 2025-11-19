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
import { RequestHandler } from "express";
import { RAI } from "../types";
import Routes from "./Routes";
import Route from "./Route";
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
declare class Wecon {
    private _routes?;
    private _roles;
    private _guestRole;
    private _postman?;
    private _onRoutesPrepared?;
    private _dev?;
    private _raiMatcher?;
    private _masterRouter?;
    private _built;
    private _raisMap?;
    private _routerMap?;
    private _middleware?;
    constructor();
    /**
     * Set the root routes for the application
     * @param routes - Routes instance containing all application routes
     * @returns this for method chaining
     */
    routes(routes: Routes): this;
    /**
     * Set the available roles for the application
     * @param roles - Array of role names
     * @returns this for method chaining
     */
    roles(roles: string[]): this;
    /**
     * Set the guest role (default role for unauthenticated users)
     * @param guestRole - Name of the guest role
     * @returns this for method chaining
     */
    guestRole(guestRole: string): this;
    /**
     * Configure Postman collection generation
     * @param config - Postman configuration object
     * @returns this for method chaining
     */
    postman(config: WeconPostmanConfig): this;
    /**
     * Set a callback to execute when routes are prepared
     * @param callback - Function to call with prepared routes
     * @returns this for method chaining
     */
    onRoutesPrepared(callback: (routes: Route[]) => void | Promise<void>): this;
    /**
     * Configure development mode options
     * @param config - Development configuration
     * @returns this for method chaining
     */
    dev(config: WeconDevConfig): this;
    /**
     * Build and compile all routes into the middleware
     * This must be called before using the Wecon instance
     * @returns this for method chaining (allows app.use(wecon.build()))
     */
    build(): this;
    /**
     * Comparator function to sort routes by specificity.
     * Ensures specific paths (static) come before dynamic paths (params).
     *
     * Priority order:
     * 1. Routes with fewer parameters (more static segments)
     * 2. Routes with greater length (deeper nesting)
     */
    private compareRoutes;
    /**
     * Create the main Express middleware function
     * @private
     */
    private createMiddleware;
    /**
     * Create a helpful error message for 404 errors
     * @private
     */
    private createHelpfulNotFoundError;
    /**
     * Create a helpful error message for authorization errors
     * @private
     */
    private createHelpfulUnauthorizedError;
    /**
     * Generate Postman collection and environment files
     * @returns Promise that resolves when generation is complete
     */
    generatePostman(): Promise<void>;
    /**
     * Get all registered routes
     * @returns Array of all routes
     */
    getRoutes(): Route[];
    /**
     * Get a specific route by RAI
     * @param rai - Route Access Identifier
     * @returns Route or undefined if not found
     */
    getRoute(rai: RAI): Route | undefined;
    /**
     * Get the Express middleware function
     * This allows using the Wecon instance directly with app.use()
     *
     * @returns Express middleware function
     */
    handler(): RequestHandler;
}
export default Wecon;
