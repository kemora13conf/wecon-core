import { Handler } from "express";
import Route from "./Route";
import ErrorRoute from "./CoreError";
import { RoutesConfig } from "../types";
import Module from "./Module";
import RoutesParam from "./RoutesParam";
import BaseClass from "./BaseClass";
import chalk from "chalk";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class Routes<T = any> extends BaseClass {
  module?: Module<T>;
  prefix: string;
  error?: ErrorRoute;
  routes: Array<Route | Routes>;
  params?: RoutesParam[];
  middlewares?: Handler[];
  postman?: {
    folderName: string;
  };

  constructor(r: RoutesConfig) {
    super(); // Call the BaseClass constructor

    this.prefix = r.prefix ? r.prefix : "";
    this.routes = r.routes;
    this.params = r.params ? r.params : [];
    this.middlewares = r.middlewares ? r.middlewares : [];
    this.postman = r.postman ? r.postman : { folderName: "" };

    try {
      this.validateRoutes();
    } catch (err) {
      const errInfo = this.getCallerInfo();
      this.handleConfigError(err as Error, errInfo);
    }
  }

  private validateRoutes(): void {
    if (!this.routes) {
      throw new Error("MISSING_ROUTES");
    }
    if (!Array.isArray(this.routes)) {
      throw new Error("INVALID_ROUTES_TYPE");
    }
  }

  private handleConfigError(
    err: Error,
    errInfo: {
      file: string;
      line: number;
      column: number;
    }
  ): void {
    const errorMessages: Record<
      string,
      { title: string; details: string; fix: string }
    > = {
      MISSING_ROUTES: {
        title: "Missing required 'routes' property",
        details: "The Routes instance requires a 'routes' array to be defined",
        fix: "Add a routes array to your configuration:\n    routes: [{ path: '/example', method: 'GET', handler: ... }]",
      },
      INVALID_ROUTES_TYPE: {
        title: "Invalid 'routes' property type",
        details:
          "The 'routes' property must be an array, but received: " +
          typeof this.routes,
        fix: "Ensure routes is an array:\n    routes: [...] // not routes: {...}",
      },
    };

    const errorConfig = errorMessages[err.message] || {
      title: err.message,
      details: "An unexpected error occurred",
      fix: "Please check your Routes configuration",
    };

    console.error(
      chalk.red.bold(
        "\n╔══════════════════════════════════════════════════════════╗"
      ),
      chalk.red.bold("\n║") +
        chalk.white.bold(
          "  Routes Configuration Error                           "
        ) +
        chalk.red.bold("   ║"),
      chalk.red.bold(
        "\n╚══════════════════════════════════════════════════════════╝\n"
      )
    );

    console.error(chalk.red.bold("✖ Error:"), chalk.white(errorConfig.title));
    console.error(chalk.gray("\n  Details:"), chalk.white(errorConfig.details));
    console.error(
      chalk.gray("\n  Location:"),
      chalk.cyan(`${errInfo.file}:${errInfo.line}:${errInfo.column}`)
    );
    console.error(chalk.yellow.bold("\n  💡 How to fix:"));
    console.error(chalk.yellow(`  ${errorConfig.fix.replace(/\n/g, "\n  ")}`));
    console.error(""); // Empty line for spacing

    // exit the process with failure
    process.exit(1);
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
      const allParams: RoutesParam[] = [];
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
        throw new Error(
          `Duplicate RAI found: ${rai} for paths "${
            raiMap.get(rai)?.path
          }" and "${fullPath}"`
        );
      } else {
        console.log("Adding RAI to map:", rai, "for path:", fullPath);
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
