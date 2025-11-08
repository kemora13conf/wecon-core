import { Handler } from "express";
import Route from "./Route";
import ErrorRoute from "./CoreError";
import { RoutesConfig, Param } from "../types";
import { InvalidRouteError } from "../errors";
import Module from "./Module";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class Routes<T = any> {
  module?: Module<T>;
  prefix: string;
  error?: ErrorRoute;
  routes: Array<Route | Routes>;
  params?: Param[];
  middlewares?: Handler[];
  postman?: {
    folderName: string;
  };

  constructor(r: RoutesConfig) {
    this.prefix = r.prefix ? r.prefix : "";
    this.routes = r.routes;
    this.params = r.params ? r.params : [];
    this.middlewares = r.middlewares ? r.middlewares : [];
    this.postman = r.postman ? r.postman : { folderName: "" };

    /**
     * All the required fields must gevin
     * throw an error if not
     */
    if (!this.routes) {
      throw new InvalidRouteError(
        "Routes instance must have a routes property"
      );
    }
    if (!Array.isArray(this.routes)) {
      throw new InvalidRouteError("Routes instance routes must be an array");
    }
  }

  public groupRoutesByRai() {
    const raiMap = new Map<
      string,
      Route & {
        params: Param[];
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

      // Retrieve the list of params from all Routes instances in the branch
      const allParams: Param[] = [];
      branch.forEach((item) => {
        if (item instanceof Routes && item.params) {
          allParams.push(...item.params);
        }
      });

      // Retrieve the list of middlewares from all Routes instances in the branch
      const allMiddlewares: Handler[] = [];
      branch.forEach((item) => {
        if (item instanceof Routes && item.middlewares) {
          allMiddlewares.push(...item.middlewares);
        }
      });

      if (raiMap.has(rai)) {
        /**
         * Remove this route and throw an error
         * because RAI must be unique
         */
        // TODO: improve error message to show both routes paths
        throw new InvalidRouteError(
          `Duplicate RAI found: ${rai} for paths "${
            raiMap.get(rai)?.path
          }" and "${fullPath}"`
        );
      } else {
        console.log("Adding RAI to map:", rai, "for path:", fullPath);
        raiMap.set(rai, {
          ...route,
          path: fullPath,
          params: allParams,
          middlewares: allMiddlewares,
        });
      }
    });

    return raiMap;
  }
}

export default Routes;
