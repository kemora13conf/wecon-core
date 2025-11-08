import { Router, Handler, RequestHandler } from "express";
import { RouteConfig } from "../types";
import { PostmanRouteItem } from "../types/postman";
import Routes from "./Routes";
import Module from "./Module";
declare class Route<T = any> {
  module?: Module<T>;
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  middlewares: Handler[] | RequestHandler[] | any[];
  name: string;
  description: string;
  rai: string;
  roles: string[];
  postman?: RouteConfig["postman"];
  constructor(r: RouteConfig);
  /**
   * This function is used to register a module to the route
   * so that we can use the module name in the route
   * and also to access the module config if needed
   */
  registerModule(module: Module<T>): void;
  buildRoute(
    router: Router,
    route: Routes,
    prefix: {
      path: string;
    }
  ): void;
  /**
   * This function is used to generate the route for postman collection (route = request)
   */
  generateRoute(pathPrefix?: string): PostmanRouteItem;
}
export default Route;
