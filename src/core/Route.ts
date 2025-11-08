import { Handler, RequestHandler } from "express";
import { v4 as uuidv4 } from "uuid";
import { RouteConfig } from "../types";
import { InvalidRouteError } from "../errors";
import Module from "./Module";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class Route<T = any> {
  module?: Module<T>;
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  middlewares: Handler[] | RequestHandler[] | any[];
  name: string;
  description: string;
  rai: string;
  roles: string[];
  postman?: RouteConfig["postman"];

  constructor(r: RouteConfig) {
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
}

export default Route;
