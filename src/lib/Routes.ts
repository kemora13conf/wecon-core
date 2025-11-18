/* eslint-disable @typescript-eslint/no-explicit-any */

import { Handler } from "express";
import Route from "./Route";
import { ErrorTraceType, PossibleErrosType, RoutesConfig } from "../types";
import Module from "./Module";
import RoutesParam from "./RoutesParam";
import BaseClass from "./BaseClass";
import errors from "../errors";
import PostmanForRoutes from "./PostmanForRoutes";

class Routes<T = any> extends BaseClass {
  module?: Module<T>;
  prefix: string;
  routes: Array<Route | Routes>;
  params?: RoutesParam[];
  middlewares?: Handler[];
  mergeParams?: boolean = false;
  postman?: PostmanForRoutes;

  constructor(r: RoutesConfig) {
    super(); // Call the BaseClass constructor

    this.prefix = r.prefix ? r.prefix : "";
    this.routes = r.routes;
    this.params = r.params ? r.params : [];
    this.middlewares = r.middlewares ? r.middlewares : [];
    this.postman = r.postman ? r.postman : { folderName: "" };
    this.mergeParams = r.mergeParams ? r.mergeParams : false;

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

  public groupRoutesByRai() {
    const raiMap = new Map<
      string,
      Route & {
        params: RoutesParam[];
        middlewares: Handler[];
      }
    >();
    /**
     * This will at first build a tree like this one
     * [
     *   [Routes, Routes, Route],
     *   [Routes, Route],
     *   [Route],
     *   [Routes, Routes, Route],
     * ]
     *
     * And each item of this is an endpoint route
     */
    const rootTree: Array<Array<Routes | Route>> = this.routes.map((r) => {
      return [this, r];
    });

    /**
     * Now we will do a while loop to go through the tree
     * and when ever we find a Routes instance we will expand it
     * to get all the way to the Route instances
     */
    let isDone = false;
    while (!isDone) {
      isDone = true;
      for (let i = 0; i < rootTree.length; i++) {
        const branch = rootTree[i];
        const lastItem = branch[branch.length - 1];
        if (lastItem instanceof Routes) {
          isDone = false;

          // Expand the routes
          lastItem.routes.forEach((r) => {
            /**
             * This will add all the routes of the last Routes instance
             * to the branch and because js is pass by reference we are modifying
             * the rootTree array directly
             */
            rootTree.push([...branch, r]);
          });
          // Remove the current branch
          rootTree.splice(i, 1);
          i--;
        } else {
          // It's a Route instance, do nothing
        }
      }
    }

    // Now we have all the endpoint routes in the rootTree
    rootTree.forEach((branch) => {
      const route = branch[branch.length - 1] as Route;
      const routeIndex = branch.length - 1; // this will be needed to determine whether to merge params or not
      const rai = route.rai;

      // get full path
      const fullPath = branch
        .map((item) => {
          if (item instanceof Routes) {
            return item.prefix;
          } else if (item instanceof Route) {
            return item.path;
          } else {
            return "";
          }
        })
        .filter((p) => p !== undefined && p !== null && p !== "")
        .join("");

      /**
       * Retrieve the list of params from all Routes instances in the branch.
       *
       * In order to this we need to make sure that we only pass params from:
       *    1. Routes to Route - always
       *    2. Routes to Routes - only if mergeParams is true
       *
       * But how can we determine that?
       * For the first case we can always check if the item index === routeIndex - 1 then it's a Routes to Route case
       * For the second case we can check if the item index < routeIndex - 1 and if mergeParams is true
       */
      const allParams: RoutesParam[] = [];
      /**
       * 1. Routes to Route - always
       * This is the easy part we just need to check if the item index === routeIndex - 1
       * and because always the branch array ends with a Route instance we can just check the last two items
       */
      if (branch.length === 2) {
        branch.forEach((item) => {
          if (item instanceof Routes && item.params) {
            const itemIndex = branch.indexOf(item);

            if (itemIndex === routeIndex - 1) {
              allParams.push(...item.params);
              return;
            }
          }
        });
      } else {
        /**
         * 2. Routes to Routes - only if mergeParams is true
         * This requires some extra processing because to pass params from the Top Routes down passing by all Routes in between
         * until we reach the Route instance we need to make sure that all the Routes in between have mergeParams set to true
         *
         * How we gonna acheive that?
         * we create a new array of all the Routes in between and check their mergeParams property and reverse is
         * so the first Routes is the las
         */
        const routesInBetween = branch
          .slice(0, -1) // remove the last Route instance
          .filter((item) => item instanceof Routes)
          .reverse() as Routes[];
        for (let i = 0; i < routesInBetween.length; i++) {
          const currentRoutes: Routes = routesInBetween[i];
          if (i === 0) {
            // always add the first Routes params
            if (currentRoutes.params) {
              allParams.push(...currentRoutes.params);
            }
          } else {
            // check mergeParams property
            if (currentRoutes.mergeParams) {
              if (currentRoutes.params) {
                allParams.push(...currentRoutes.params);
              }
            } else {
              // stop the loop
              break;
            }
          }
        }
      }

      /**
       * Extra validation on params make sure that they are unique and
       * keep only the last one in case of duplicates
       */
      const uniqueParamsMap = new Map<string, RoutesParam>();
      allParams.forEach((param) => {
        uniqueParamsMap.set(param.path, param);
      });
      const uniqueParams = Array.from(uniqueParamsMap.values());
      // assign back to allParams
      allParams.length = 0; // clear the array
      allParams.push(...uniqueParams);
      
      /**
       * Clear the uniqueParamsMap to free memory
      */
     uniqueParamsMap.clear();
    

      // Retrieve the list of middlewares from all Routes instances in the branch
      const allMiddlewares: Handler[] = [];
      branch.forEach((item) => {
        if (item instanceof Routes && item.middlewares) {
          allMiddlewares.push(...item.middlewares);
        } else if (item instanceof Route && item.middlewares) {
          allMiddlewares.push(...item.middlewares);
        } else {
          // do nothing
        }
      });

      if (raiMap.has(rai)) {
        /**
         * Remove this route and throw an error
         * because RAI must be unique
         */
        throw new errors.ConfigError(`DUPLICATE_RAI:${rai}`, {
          route,
        });
      } else {
        const extendedRoute = Object.assign(
          Object.create(Object.getPrototypeOf(route)),
          route,
          {
            path: fullPath,
            params: allParams,
            middlewares: allMiddlewares,
          }
        );
        raiMap.set(rai, extendedRoute);
      }
    });

    return raiMap;
  }

  public test() {
    throw new Error("Method not implemented.");
  }
}

export default Routes;
