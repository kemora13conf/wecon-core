import { Router, Handler } from "express";
import { v4 as uuidv4 } from "uuid";
import { IPostmanUrl, IRoute } from "../types";
import { PostmanRouteItem } from "../types/postman";
import Routes from "./Routes";
import { InvalidRouteError } from "../errors";
import Module from "./Module";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class Route<T = any> {
  module?: Module<T>;
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  middlewares: Handler[];
  name: string;
  description: string;
  rai: string;
  roles: string[];
  postman?: IRoute["postman"];

  constructor(r: IRoute) {
    this.id = uuidv4();
    this.method = r.method;
    this.path = r.path;
    this.middlewares = r.middlewares;
    this.name = r.name ? r.name : `[${this.method}] ${this.path}`;
    this.description = r.description ? r.description : "";
    this.rai = r.rai;
    this.roles = r.roles;
    this.postman = r.postman
      ? r.postman
      : { headers: [], body: {}, params: [] };

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
  /**
   * This function is used to register a module to the route
   * so that we can use the module name in the route
   * and also to access the module config if needed
   */
  public registerModule(module: Module<T>) {
    this.module = module;
    /**
     * If the module has a name, we can set it to the route
     */
    if (module.name) {
      this.name = `${module.name} - ${this.name}`;
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
    let fullPath = pathPrefix + this.path;

    // Extract all express's router parameters from the path
    // This is to replace the parameters with Postman's variable syntax
    // For example, if the path is "/users/:userId", it will be replaced with "/users/{{ userId }}"
    const expressRouterParamRegex = /:([a-zA-Z0-9_]+)/g; // Extract path parameters from the route path
    fullPath = fullPath.replace(expressRouterParamRegex, "{{ $1 }}");

    // Remove trailing slashes from the path
    const urlParts = fullPath.split("?")[0];

    // Create an array of path segments, filtering out empty segments
    // This is to ensure that the path is correctly formatted for Postman
    // and does not contain any empty segments that could cause issues
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
    // let postmanBody = {};
    // if (
    //   ["POST", "PUT", "PATCH"].includes(this.method.toUpperCase()) &&
    //   this.postman?.body
    // ) {
    //   postmanBody = {
    //     mode: "raw",
    //     raw: JSON.stringify(this.postman.body, null, 2),
    //     options: { raw: { language: "json" } },
    //   };
    // }
    // the old way

    /**
     * Let's use the new way to handle postman body
     * by checkin if the headers are present, check if they have a content-type
     *    - if they have a content-type of application/json we will build the body as a raw json object
     *    - if they have a content-type of application/x-www-form-urlencoded we will build the body as a form object
     *    - if they have a content-type of multipart/form-data we will build the body as a form-data object
     *    - if they have a content-type of text/plain we will build the body as a text object
     */
    let postmanBody = {};

    /**
     * This is the default headers for the postman body
     * if the headers are not present we will use this
     */
    const bodyConfig = {
      headers: this.postman?.headers
        ?.map((item) => {
          const allowedKeys = ["Content-Type"];
          const allowedValues = [
            "application/json",
            "application/xml",
            "text/html",
            "text/plain",
            "application/x-www-form-urlencoded",
            "multipart/form-data",
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/pdf",
            "text/css",
            "application/javascript",
          ];
          if (
            allowedKeys.includes(item.key) &&
            allowedValues.includes(item.value)
          ) {
            return {
              key: item.key,
              value: item.value,
              description: item.description || "",
            };
          }
          return null;
        })
        .filter(Boolean) || [
        { key: "Content-Type", value: "application/json" },
      ],
    };

    const contentTypeHeader = bodyConfig.headers.find(
      (header) => header?.key === "Content-Type"
    );

    if (contentTypeHeader) {
      switch (contentTypeHeader.value) {
        case "application/json":
          postmanBody = {
            mode: "raw",
            raw: JSON.stringify(this.postman?.body || {}, null, 2),
            options: { raw: { language: "json" } },
          };
          break;
        case "application/x-www-form-urlencoded":
          postmanBody = {
            mode: "urlencoded",
            urlencoded: Object.entries(this.postman?.body || {}).map(
              ([key, value]) => ({ key, value: String(value) })
            ),
          };
          break;
        case "multipart/form-data":
          postmanBody = {
            mode: "formdata",
            formdata: Object.entries(this.postman?.body || {}).map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ([key, value]: [string, any]) => {
                /**
                 * Here is a tricky part, we need to check if the value is an object
                 * if so we check if it has a type property
                 * if it has a type property we use it as the type of the form-data
                 * if not we use "text" as the type of the form-data
                 */
                if (typeof value === "object" && value !== null && value.type) {
                  return {
                    key,
                    value: String(value.value || ""),
                    type: value.type || "text",
                  };
                }
                return { key, value: String(value), type: "text" };
              }
            ),
          };
          break;
        case "text/plain":
          postmanBody = {
            mode: "raw",
            raw: String(this.postman?.body || ""),
            options: { raw: { language: "text" } },
          };
          break;
        default:
          postmanBody = {};
      }
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
