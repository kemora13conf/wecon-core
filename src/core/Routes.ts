import {
    Router,
} from 'express';
import { PathParams, RequestHandlerParams } from 'express-serve-static-core';
import Route from './Route';
import ErrorRoute from './ErrorRoute';
import { IRoutes, Param } from '../types';
import { InvalidRouteError } from '../errors';
import { PostmanRouteItem } from '../types/postman';

class Routes {
    prefix: PathParams;
    error?: ErrorRoute;
    routes: Array<Route | Routes>;
    params?: Param[];
    middlewares?: RequestHandlerParams[];
    postman?: {
        folderName: string;
    };
    module?: string;

    constructor(r: IRoutes) {
        this.prefix = r.prefix;
        this.routes = r.routes;
        this.params = r.params;
        this.middlewares = r.middlewares;
        this.postman = r.postman ? r.postman : { folderName: '' };
        this.module = r.module ? r.module : undefined;
        this.error = r.error ? r.error : undefined;
    }

    buildRouter(p_router?: Router, p_prefix?: { path: string }): Router {
        const router = p_router ? p_router : Router();
        let prefix = p_prefix ? p_prefix : { path: '' };
        prefix = {
            path: prefix.path + this.prefix,
        };

        if (this.error) {

            router.use(this.error.middleware);
        }


        // Handle params
        this.handleParams(router);

        // Handle middlewares
        if (this.middlewares) {
            this.middlewares.forEach(middleware => {
                router.use(prefix.path, middleware);
            });
        }

        this.routes.forEach(route => {
            if (route instanceof Routes) {
                route.buildRouter(router, prefix);
            } else if (route instanceof Route) {
                route.buildRoute(router, this, prefix);
            } else {
                throw new InvalidRouteError(`Invalid Route: ${route}`);
            }
        });
        return router;
    }

    private handleParams(router: Router): void {
        if (this.params) {
            this.params.forEach(param => {
                if (!param.path || typeof param.method !== 'function') {
                    throw new InvalidRouteError(`
            INVALID params FIELD: params must have a path and a method
            PATH: ${param.path}
            METHOD: ${typeof param.method === 'function' ? 'function' : 'null'}
          `);
                }

                const paramPath = param.path.startsWith(':')
                    ? param.path.slice(1)
                    : param.path;
                router.param(paramPath, param.method);
            });
        }
    }



    /**
   * Generates a routes folder structure and processes all routes recursively.
   * 
   * This function creates a routes folder if createFolder is true and processes
   * all routes by either:
   * - Calling generateFolder() if the route is an instance of Routes
   * - Calling generateRoute() if the route is an instance of Route
   * 
   * @param pathPrefix - The prefix to prepend to the current path. Defaults to an empty string.
   * @returns Either a folder object containing route items or a flat array of route items
   * @throws Error if an invalid route type is encountered
   */
    generateFolder(pathPrefix: string = ''): PostmanRouteItem[] | PostmanRouteItem {
        const currentPathPrefix = pathPrefix + this.prefix;

        const items: PostmanRouteItem[] = this.routes
            .map(route => {
                if (route instanceof Routes) {
                    return route.generateFolder(currentPathPrefix);
                } else if (route instanceof Route) {
                    return route.generateRoute(currentPathPrefix);
                } else {
                    throw new Error('Invalid route type');
                }
            })
            .flat();

        // Return a folder structure if a folder name is specified in postman config
        if (this.postman?.folderName) {
            return {
                name: this.postman.folderName,
                item: items,
            } as PostmanRouteItem;
        }

        return items as PostmanRouteItem[];
    }
}

export default Routes;