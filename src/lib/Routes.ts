
import { Handler } from "express";
import Route from "./Route";
import { ErrorTraceType, PossibleErrosType, RoutesConfig, OpenApiGroupConfig } from "../types";
import RoutesParam from "./RoutesParam";
import BaseClass from "./BaseClass";
import errors from "../errors";
import PostmanGroup from "./PostmanGroup";

class Routes extends BaseClass {
  prefix: string;
  routes: Array<Route | Routes>;
  params?: RoutesParam[];
  middlewares?: Handler[];
  mergeParams?: boolean = false;
  postman?: PostmanGroup;
  openapi?: OpenApiGroupConfig;
  meta?: Record<string, unknown>;

  constructor(r: RoutesConfig) {
    super(); // Call the BaseClass constructor

    this.prefix = r.prefix ? r.prefix : "";
    this.routes = r.routes;
    this.params = r.params ? r.params : [];
    this.middlewares = r.middlewares ? r.middlewares : [];
    this.postman = r.postman
      ? r.postman
      : new PostmanGroup({ folderName: "" });
    this.openapi = r.openapi;
    this.mergeParams = r.mergeParams ? r.mergeParams : false;
    this.meta = r.meta;

    try {
      this.validateRoutes();
    } catch (err) {
      const errInfo = this.getCallerInfo();
      this.handleConfigError(err as Error, errInfo);
    }
  }

  private validateRoutes(): void {
    /**
     * 1. Validate the prefix property
     */
    if (this.prefix && typeof this.prefix !== "string") {
      throw new errors.ConfigError("ROUTES_CONFIG:INVALID_PREFIX_TYPE");
    }

    /**
     * 2. Validate the routes property
     */
    if (!this.routes) {
      throw new errors.ConfigError("ROUTES_CONFIG:MISSING_ROUTES");
    }
    if (!Array.isArray(this.routes)) {
      throw new Error("ROUTES_CONFIG:INVALID_ROUTES_TYPE");
    }

    /**
     * 3. Validate the middlewares property
     */
    if (this.middlewares && !Array.isArray(this.middlewares)) {
      throw new errors.ConfigError("ROUTES_CONFIG:INVALID_MIDDLEWARES_TYPE");
    }

    /**
     * 4. Validate params property
     */
    if (this.params && !Array.isArray(this.params)) {
      throw new errors.ConfigError("ROUTES_CONFIG:INVALID_PARAMS_TYPE");
    }

    /**
     * 5. Validate the mergeParams property
     */
    if (this.mergeParams && typeof this.mergeParams !== "boolean") {
      throw new errors.ConfigError("ROUTES_CONFIG:INVALID_MERGE_PARAMS_TYPE");
    }
  }

  private handleConfigError(err: Error, errInfo: ErrorTraceType): void {
    const POSSIBLE_ERRORS: PossibleErrosType = {
      "ROUTES_CONFIG:INVALID_PREFIX_TYPE": {
        title: "Invalid 'prefix' property type",
        details:
          "The 'prefix' property must be a string, but received: " +
          typeof this.prefix,
        fix: "Ensure prefix is a string, for example:\n    prefix: '/api' or prefix: ''",
      },
      "ROUTES_CONFIG:MISSING_ROUTES": {
        title: "Missing required 'routes' property",
        details: "The Routes instance requires a 'routes' array to be defined",
        fix: "Add a routes array to your configuration:\n    routes: [new Routes(...), new Route(...)]",
      },
      "ROUTES_CONFIG:INVALID_ROUTES_TYPE": {
        title: "Invalid 'routes' property type",
        details:
          "The 'routes' property must be an array, but received: " +
          typeof this.routes,
        fix: "Ensure routes is an array:\n    routes: [...] // not routes: {...}",
      },
      "ROUTES_CONFIG:INVALID_MIDDLEWARES_TYPE": {
        title: "Invalid 'middlewares' property type",
        details:
          "The 'middlewares' property must be an array of express handlers, but received: " +
          typeof this.middlewares,
        fix: "Provide an array of middleware functions or an empty array:\n    middlewares: [middleware1, middleware2] or middlewares: []",
      },
      "ROUTES_CONFIG:INVALID_PARAMS_TYPE": {
        title: "Invalid 'params' property type",
        details:
          "The 'params' property must be an array of RoutesParam instances, but received: " +
          typeof this.params,
        fix: "Provide an array of RoutesParam instances or an empty array:\n    params: [new RoutesParam(...)] or params: []",
      },
      "ROUTES_CONFIG:INVALID_MERGE_PARAMS_TYPE": {
        title: "Invalid 'mergeParams' property type",
        details:
          "The 'mergeParams' property must be a boolean, but received: " +
          typeof this.mergeParams,
        fix: "Set mergeParams to a boolean value, for example:\n    mergeParams: true",
      },
    };

    const errorConfig = POSSIBLE_ERRORS[err.message] || {
      title: err.message,
      details: "An unexpected error occurred",
      fix: "Please check your Routes configuration",
    };
    super.logError(errorConfig, errInfo);
  }

  public groupRoutesByRai(): Map<
    string,
    Route & { params: RoutesParam[]; middlewares: Handler[] }
  > {
    const raiMap = new Map<
      string,
      Route & { params: RoutesParam[]; middlewares: Handler[] }
    >();

    const traverse = (
      current: Routes | Route,
      accumulatedPath: string,
      accumulatedParams: RoutesParam[],
      accumulatedMiddlewares: Handler[],
      parentsMergeParams: boolean
    ) => {
      // --- HANDLE ROUTE (Endpoint) ---
      if (current instanceof Route) {
        const fullPath = accumulatedPath + current.path;

        // Combine accumulated middlewares with route-specific ones
        const finalMiddlewares = [
          ...accumulatedMiddlewares,
          ...(current.middlewares || []),
        ];

        // Combine accumulated params
        const finalParams = this.deduplicateParams(accumulatedParams);

        if (raiMap.has(current.rai)) {
          const errorConfig = {
            title: "Duplicate 'rai' detected",
            details: "The 'rai' provided is already registered: " + current.rai,
            fix: "Ensure each route has a unique rai:\n    rai: 'users:create' // Different from existing RAIs",
          };
          // Use the debug info captured at instantiation time to point to the user's code
          current.logError(errorConfig, current.debugInfo);
        }

        // Create the flattened route object
        const extendedRoute = Object.assign(
          Object.create(Object.getPrototypeOf(current)),
          current,
          {
            path: fullPath, // The absolute path (e.g. /api/v1/users/:id)
            params: finalParams,
            middlewares: finalMiddlewares,
          }
        );

        raiMap.set(current.rai, extendedRoute);
        return;
      }

      // --- HANDLE ROUTES (Group) ---
      if (current instanceof Routes) {
        const nextPath = accumulatedPath + current.prefix;

        // Middleware Inheritance
        const nextMiddlewares = [
          ...accumulatedMiddlewares,
          ...(current.middlewares || []),
        ];

        // Param Inheritance Logic
        let nextParams: RoutesParam[] = [];

        if (parentsMergeParams) {
          // If merging, take all previous params + current params
          nextParams = [...accumulatedParams, ...(current.params || [])];
        } else {
          // If NOT merging, strictly take ONLY current params (reset scope)
          // Unless it's the very first level, but typically mergeParams=false means "block parent params"
          // However, usually, we keep accumulatedParams if we want path context,
          // but your logic seemed to want strictly scoped params.
          // Standard Express behavior: Params are positional.
          // To match your previous logic:
          nextParams = current.params || [];
        }

        // Recurse into children
        current.routes.forEach((child) => {
          traverse(
            child,
            nextPath,
            nextParams,
            nextMiddlewares,
            current.mergeParams || false
          );
        });
      }
    };

    // Start traversal
    traverse(this, "", [], [], false);

    return raiMap;
  }

  private deduplicateParams(params: RoutesParam[]): RoutesParam[] {
    const unique = new Map<string, RoutesParam>();
    params.forEach((p) => unique.set(p.path, p));
    return Array.from(unique.values());
  }

  public test() {
    throw new Error("Method not implemented.");
  }
}

export default Routes;
