/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handler, RequestHandler } from "express";
import { v4 as uuidv4 } from "uuid";
import { RouteConfig, ErrorTraceType, PossibleErrosType, RAI } from "../types";
import BaseClass from "./BaseClass";
import errors from "../errors";
import PostmanForRoute from "./PostmanForRoute";
import RoutesParam from "./RoutesParam";

class Route extends BaseClass {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  params?: Array<RoutesParam> = [];
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
  static readonly registeredRAIs = new Map<RAI, RAI>();

  constructor(r: RouteConfig) {
    super(); // Call the BaseClass constructor

    this.id = uuidv4();
    this.method = r.method;
    this.path = r.path;
    this.middlewares = r.middlewares;
    this.name = r.name ? r.name : `[${this.method}] ${this.path}`;
    this.description = r.description ? r.description : "";
    this.rai = r.rai;
    this.roles = r.roles;
    this.postman = r.postman;

    try {
      this.validateRoute();

      // here we can register the RAI to ensure uniqueness
      Route.registeredRAIs.set(this.rai, this.rai);
    } catch (err) {
      const errInfo = this.getCallerInfo();
      this.handleConfigError(err as Error, errInfo);
    }
  }

  private validateRoute(): void {
    /**
     * 1. Validate the method property
     */
    if (!this.method) {
      throw new errors.ConfigError("ROUTE_CONFIG:MISSING_METHOD");
    }

    /**
     * 2. Validate the path property
     */
    if (!this.path) {
      throw new errors.ConfigError("ROUTE_CONFIG:MISSING_PATH");
    }

    /**
     * 3. Validate the rai property
     */
    if (!this.rai) {
      throw new errors.ConfigError("ROUTE_CONFIG:MISSING_RAI");
    }
    if (typeof this.rai !== "string") {
      throw new errors.ConfigError("ROUTE_CONFIG:INVALID_RAI_TYPE");
    }
    if (Route.registeredRAIs.has(this.rai)) {
      throw new errors.ConfigError(`ROUTE_CONFIG:DUPLICATE_RAI`);
    }

    /**
     * 4. Validate the roles property
     */
    if (!this.roles) {
      throw new errors.ConfigError("ROUTE_CONFIG:MISSING_ROLES");
    }

    /**
     * 5. Validate the middlewares property type
     */
    if (!Array.isArray(this.middlewares)) {
      throw new errors.ConfigError("ROUTE_CONFIG:INVALID_MIDDLEWARES_TYPE");
    }

    /**
     * 6. Validate that middlewares array is not empty
     */
    if (this.middlewares.length === 0) {
      throw new errors.ConfigError("ROUTE_CONFIG:EMPTY_MIDDLEWARES");
    }
  }

  private handleConfigError(err: Error, errInfo: ErrorTraceType): void {
    const POSSIBLE_ERRORS: PossibleErrosType = {
      "ROUTE_CONFIG:MISSING_METHOD": {
        title: "Missing required 'method' property",
        details: "The Route instance requires a 'method' to be defined",
        fix: "Add a method to your route configuration:\n    method: 'GET' | 'POST' | 'PUT' | 'DELETE'",
      },
      "ROUTE_CONFIG:MISSING_PATH": {
        title: "Missing required 'path' property",
        details: "The Route instance requires a 'path' to be defined",
        fix: "Add a path to your route configuration:\n    path: '/users/:id'",
      },
      "ROUTE_CONFIG:MISSING_RAI": {
        title: "Missing required 'rai' property",
        details:
          "The Route instance requires a unique 'rai' (Route Access Identifier) to be defined",
        fix: "Add a rai to your route configuration:\n    rai: 'users:read' // Must be unique across all routes",
      },
      "ROUTE_CONFIG:INVALID_RAI_TYPE": {
        title: "Invalid 'rai' property type",
        details:
          "The 'rai' property must be a string, but received: " +
          typeof this.rai,
        fix: "Ensure rai is a string:\n    rai: 'users:read'",
      },
      "ROUTE_CONFIG:DUPLICATE_RAI": {
        title: "Duplicate 'rai' detected",
        details: "The 'rai' provided is already registered: " + this.rai,
        fix: "Ensure each route has a unique rai:\n    rai: 'users:create' // Different from existing RAIs",
      },
      "ROUTE_CONFIG:MISSING_ROLES": {
        title: "Missing required 'roles' property",
        details: "The Route instance requires a 'roles' array to be defined",
        fix: "Add roles to your route configuration:\n    roles: ['admin', 'user'] // or roles: ['guest'] for public routes",
      },
      "ROUTE_CONFIG:INVALID_MIDDLEWARES_TYPE": {
        title: "Invalid 'middlewares' property type",
        details:
          "The 'middlewares' property must be an array, but received: " +
          typeof this.middlewares,
        fix: "Ensure middlewares is an array:\n    middlewares: [authMiddleware, validateMiddleware]",
      },
      "ROUTE_CONFIG:EMPTY_MIDDLEWARES": {
        title: "Empty 'middlewares' array",
        details:
          "The Route instance requires at least one middleware function to handle the request",
        fix: "Add at least one middleware function to handle the route:\n    middlewares: [(req, res) => { res.json({ data: 'example' }) }]",
      },
    };

    const errorConfig = POSSIBLE_ERRORS[err.message] || {
      title: err.message,
      details: "An unexpected error occurred",
      fix: "Please check your Route configuration",
    };

    super.logError(errorConfig, errInfo);
  }

  /**
   * isAuthorized - Check if the provided user roles are authorized to access this route
   * @param {string[]} userRoles - Array of roles assigned to the user
   * @returns {boolean} - Returns true if authorized, false otherwise
   */
  isAuthorized(userRoles: string[]): boolean {
    // If the route has no roles defined, it's considered protected
    if (this.roles.length === 0) {
      return false;
    }

    // Check if any of the user's roles match the route's allowed roles
    for (const role of userRoles) {
      if (this.roles.includes(role)) {
        return true; // Authorized
      }
    }

    return false; // Not authorized
  }
}

export default Route;
