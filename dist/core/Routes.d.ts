import { Router, Handler } from "express";
import Route from './Route';
import ErrorRoute from './ErrorRoute';
import { IRoutes, Param } from '../types';
import { PostmanRouteItem } from '../types/postman';
declare class Routes {
    prefix: string;
    error?: ErrorRoute;
    routes: Array<Route | Routes>;
    params?: Param[];
    middlewares?: Handler[];
    postman?: {
        folderName: string;
    };
    module?: string;
    constructor(r: IRoutes);
    buildRouter(p_router?: Router, p_prefix?: {
        path: string;
    }): Router;
    private handleParams;
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
    generateFolder(pathPrefix?: string): PostmanRouteItem[] | PostmanRouteItem;
}
export default Routes;
