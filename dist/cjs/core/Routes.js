"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Route_1 = __importDefault(require("./Route"));
const errors_1 = require("../errors");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class Routes {
    constructor(r) {
        this.prefix = r.prefix ? r.prefix : "";
        this.routes = r.routes;
        this.params = r.params ? r.params : [];
        this.middlewares = r.middlewares ? r.middlewares : [];
        this.postman = r.postman ? r.postman : { folderName: "" };
        this.error = r.error ? r.error : undefined;
        /**
         * All the required fields must gevin
         * throw an error if not
         */
        if (!this.routes) {
            throw new errors_1.InvalidRouteError("Routes instance must have a routes property");
        }
        if (!Array.isArray(this.routes)) {
            throw new errors_1.InvalidRouteError("Routes instance routes must be an array");
        }
    }
    registerModule(module) {
        this.module = module;
        this.routes.forEach((route) => {
            if (route instanceof Routes) {
                route.registerModule(module);
            }
            else if (route instanceof Route_1.default) {
                route.registerModule(module);
            }
            else if (typeof route === "object" && route !== null) {
                route.module = module;
            }
        });
    }
    buildRouter(p_router, p_prefix) {
        const router = p_router ? p_router : (0, express_1.Router)();
        let prefix = p_prefix ? p_prefix : { path: "" };
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
            this.middlewares.forEach((middleware) => {
                router.use(prefix.path, middleware);
            });
        }
        this.routes.forEach((route) => {
            if (route instanceof Routes) {
                route.buildRouter(router, prefix);
            }
            else if (route instanceof Route_1.default) {
                route.buildRoute(router, this, prefix);
            }
            else {
                throw new errors_1.InvalidRouteError(`Invalid Route: ${route}`);
            }
        });
        return router;
    }
    handleParams(router) {
        if (this.params) {
            this.params.forEach((param) => {
                if (!param.path || typeof param.method !== "function") {
                    throw new errors_1.InvalidRouteError(`
INVALID params FIELD: params must have a path and a method
    PATH: ${param.path}
    METHOD: ${typeof param.method === "function" ? "function" : "null"}
          `);
                }
                const paramPath = param.path.startsWith(":")
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
    generateFolder(pathPrefix = "") {
        const currentPathPrefix = pathPrefix + this.prefix;
        const items = this.routes
            .map((route) => {
            if (route instanceof Routes) {
                return route.generateFolder(currentPathPrefix);
            }
            else if (route instanceof Route_1.default) {
                return route.generateRoute(currentPathPrefix);
            }
            else {
                throw new Error("Invalid route type");
            }
        })
            .flat();
        // Return a folder structure if a folder name is specified in postman config
        if (this.postman?.folderName) {
            return {
                name: this.postman.folderName,
                item: items,
            };
        }
        return items;
    }
}
exports.default = Routes;
