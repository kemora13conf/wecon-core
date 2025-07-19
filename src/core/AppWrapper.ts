import { Express, RequestHandler } from "express";
import { AppWrapperConfig } from "../types";
import PostmanController from "./PotmanController";
import { findRequestRai } from "../lib/rais/middlewares/findRequestRai";
import { isAuthorized } from "../lib/rais/middlewares/isAuthorized";
import { InitializeCreatingRAIs } from "../lib/rais";

class AppWrapper extends PostmanController {
  private app: Express;
  private roles?: string[];

  constructor(config: AppWrapperConfig) {
    super(config.routes, config.postman);
    this.app = config.app;
    this.routes = config.routes;
    this.roles = config.roles ? config.roles : [];
  }
  public getExpressApp(
    middlewares: RequestHandler[] = [],
    postMiddlewares: RequestHandler[] = []
  ): Express {
    /**
     * Seed RAIs & roles in the app.locals
     * This is used to find the RAI for the current request
     * and to check if the user is authorized to access the route
     */
    const { rais } = InitializeCreatingRAIs(this.routes);
    this.app.locals.roles = this.roles?.map((role) => {
      return {
        _id: role,
        name: role,
      };
    });
    this.app.locals.rais = rais;

    this.app.use(findRequestRai, isAuthorized);

    /**
     * Register middlewares
     * These middlewares will be applied to all routes
     *
     * we are doing this because if you register any middlewares
     * after the routes, they will not be executed
     */
    if (middlewares && middlewares.length > 0) {
      middlewares.forEach((middleware) => {
        this.app.use(middleware);
      });
    }
    this.app.use(this.routes.buildRouter());
    /**
     * Register post middlewares
     * These middlewares will be applied after the routes
     */
    if (postMiddlewares && postMiddlewares.length > 0) {
      postMiddlewares.forEach((middleware) => {
        this.app.use(middleware);
      });
    }

    return this.app;
  }
}

export default AppWrapper;
