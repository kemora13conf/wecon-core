import { Router, Handler } from "express";
import { v4 as uuidv4 } from "uuid";
import { IPostmanUrl, IRoute } from "../types";
import { PostmanRouteItem } from "../types/postman";
import Routes from "./Routes";
import { InvalidRouteError } from "../errors";

class Route {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  middlewares: Handler[];
  name: string;
  description: string;
  rai: string;
  roles: string[];
  postman?: {
    body?: Record<string, unknown>;
    params?: Array<{ key: string; value: string; description: string }>;
  };

  constructor(r: IRoute) {
    this.id = uuidv4();
    this.method = r.method;
    this.path = r.path;
    this.middlewares = r.middlewares;
    this.name = r.name ? r.name : `[${this.method}] ${this.path}`;
    this.description = r.description ? r.description : "";
    this.rai = r.rai;
    this.roles = r.roles;
    this.postman = r.postman ? r.postman : { body: {}, params: [] };

    /**
     * All the required fields must gevin
     * throw an error if not
     */
    if (!this.method) {
      throw new InvalidRouteError("Route instance must have a method");
    }
    if (!this.path) {
      throw new InvalidRouteError("Route instance must have a path");
    }
    if (!this.rai) {
      throw new InvalidRouteError("Route instance must have a rai");
    }
    if (!this.roles) {
      throw new InvalidRouteError("Route instance must have a roles");
    }
    if (!Array.isArray(this.middlewares)) {
      throw new InvalidRouteError(
        "Route instance middlewares must be an array"
      );
    }
  }

  buildRoute(router: Router, route: Routes, prefix: { path: string }): void {
    /**
     * After Making sure that the route is an instance of Routes
     * we need :
     *   - check if the route has any params if so we need to add them to the router
     *   - call the buildRouter method of the Routes class
     */
    if (route.params) {
      if (Array.isArray(route.params)) {
        route.params.forEach((param) => {
          if (param.path) {
            if (typeof param.method === "function") {
              /**
               * Make sure that the param.path dosn't ':' in the beginning
               */
              if (param.path[0] === ":") {
                param.path = param.path.slice(1);
              }
              router.param(param.path, param.method);
            } else {
              throw new InvalidRouteError(`
INVALID params FIELD: params must have a method
    PREFIX: ${route.prefix}
    PARAM: [
        ...
        {
            PATH: ${param.path},
            METHOD: null
        }
        ...
    ]
              `);
            }
          } else {
            throw new InvalidRouteError(`
INVALID params FIELD: params must have a path
    PREFIX: ${route.prefix}
            `);
          }
        });
      } else {
        throw new InvalidRouteError(`
INVALID params FIELD: params must be an array 
    PREFIX: ${route.prefix}
        `);
      }
    }

    /**
     * We check that all the middlewares are valid function
     * and if not we throw an error
     */
    this.middlewares.forEach((middleware) => {
      if (typeof middleware !== "function") {
        throw new InvalidRouteError(`
INVALID MIDDLEWARE FIELD: middleware must be a function
    PATH: ${prefix.path + this.path}
    METHOD: ${this.method}
    RESOURCE: ${this.rai}
    MIDDLEWARES: [${this.middlewares.map((m) =>
      typeof m === "function" ? " function " : " null "
    )}] 
        `);
      }
    });
    /**
     * Here we can use the switch case to handle the routes
     * based on the method
     */
    switch (this.method) {
      case "GET":
        router.get(prefix.path + this.path, ...this.middlewares);
        break;
      case "POST":
        router.post(prefix.path + this.path, ...this.middlewares);
        break;
      case "PUT":
        router.put(prefix.path + this.path, ...this.middlewares);
        break;
      case "DELETE":
        router.delete(prefix.path + this.path, ...this.middlewares);
        break;
    }
  }

  /**
   * This function is used to generate the route for postman collection (route = request)
   */
  generateRoute(pathPrefix: string = "") {
    const fullPath = pathPrefix + this.path;
    const urlParts = fullPath.split("?")[0];
    const pathSegments = urlParts
      .split("/")
      .filter((segment) => segment !== "");

    // Construct Postman URL object
    const postmanUrl: IPostmanUrl = {
      raw: `{{base_url}}${urlParts}`,
      host: ["{{base_url}}"],
      path: pathSegments,
    };

    // Add query parameters
    if (
      this.postman &&
      this.postman.params &&
      this.postman.params?.length > 0
    ) {
      postmanUrl.query = this.postman.params.map((param) => ({
        key: param.key,
        value: param.value,
        description: param.description || "",
      }));
    }

    // Construct request body
    let postmanBody = {};
    if (
      ["POST", "PUT", "PATCH"].includes(this.method.toUpperCase()) &&
      this.postman?.body
    ) {
      postmanBody = {
        mode: "raw",
        raw: JSON.stringify(this.postman.body, null, 2),
        options: { raw: { language: "json" } },
      };
    }

    return {
      name: this.name,
      request: {
        method: this.method.toUpperCase(),
        url: postmanUrl,
        description: this.description,
        body: postmanBody,
      },
    } as PostmanRouteItem;
  }
}

export default Route;
