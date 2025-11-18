"use strict";
/**
 * The Last Middleware - Dynamic Route Authorization & Matching
 *
 * @module TheLastMiddleware
 * @author Abdelghani El Mouak
 * @license MIT
 *
 * @description
 * A smart routing middleware that automatically handles authorization and route matching:
 *
 * **How it works:**
 * 1. **Route Caching** - Creates and caches Express Routers for each endpoint using RAI (Route Authorization Identifier)
 * 2. **Request Matching** - Identifies incoming requests by their RAI
 * 3. **Authorization** - Validates user permissions before routing
 * 4. **Smart Forwarding** - Routes authorized requests to their cached Router
 *
 * **Why use this?**
 * - ⚡ Performance: Routes are pre-built and cached in a Map
 * - 🔒 Security: Built-in authorization layer
 * - 🎯 Clean: No need to manually wire up auth checks for each route
 * - 📦 Centralized: Single point of control for all route handling
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TheLastMiddleware = TheLastMiddleware;
const express_1 = require("express");
const Routes_1 = __importDefault(require("./Routes"));
const findRequestRai_1 = require("../middlewares/findRequestRai");
const errors_1 = __importDefault(require("../errors"));
/**
 * The last middleware to be used in the application. It handles route matching,
 * authorization checks, and error handling for unmatched routes.
 *
 * @param config - Configuration object containing root routes, roles, and guest role.
 * @returns An Express middleware function.
 */
function TheLastMiddleware(config) {
    const { rootRoutes, roles, guestRole = "guest" } = config;
    /**
     * Validate the configuration object.
     * @throws Will throw an error if the configuration is invalid.
     */
    switch (true) {
        case !(rootRoutes instanceof Routes_1.default):
            throw new Error("TheLastMiddleware: 'rootRoutes' must be an instance of the Routes class.");
        case !Array.isArray(roles):
            throw new Error("TheLastMiddleware: 'roles' must be an array of role definitions.");
        case typeof guestRole !== "string":
            throw new Error("TheLastMiddleware: 'guestRole' must be a string representing the guest role.");
    }
    /**
     * Group routes by their RAI for efficient lookup during request handling.
     * This creates a Map where each key is a RAI and the value is the corresponding Route.
     */
    const RaisMap = rootRoutes.groupRoutesByRai();
    /**
     * After Preparing The list of Routes
     * we need to execute the callback onRoutesPrepared if provided
     *
     * @description
     * This callback can be used to perform additional setup or logging
     * once all routes have been prepared and cached.
     * Sometimes user may want to save all routes in the database or log them for auditing purposes.
     */
    if (typeof config.onRoutesPrepared === "function") {
        config.onRoutesPrepared(Array.from(RaisMap.values()));
    }
    /**
     * Now we have to turn each Route in the RaisMap into an Express Router
     * and store it back in the map for quick access during request handling.
     */
    const RouterMap = new Map();
    RaisMap.forEach((route, rai) => {
        const router = (0, express_1.Router)({
            mergeParams: true,
            strict: false,
        });
        // Define the route handler
        switch (route.method) {
            case "GET":
                router.get("", ...route.middlewares);
                break;
            case "POST":
                router.post("", ...route.middlewares);
                break;
            case "PUT":
                router.put("", ...route.middlewares);
                break;
            case "DELETE":
                router.delete("", ...route.middlewares);
                break;
        }
        const rootRouter = (0, express_1.Router)({
            mergeParams: true,
            strict: false,
        });
        /**
         * Params must be registered on the rootRouter
         * because if we register them on the child router
         * they won't be accessible.
         *
         * Here is why:
         * Actually i don't know why? when i register params in the router not the rootRouter
         * express reconize the param but it middleware never gets executes i don't know why.
         * Any way whem i registered params in the rootRouter it worked perfectly
         * .
         */
        route.params.forEach((param) => {
            rootRouter.param(param.path, param.middleware);
        });
        // Mount the router on the rootRouter with the appropriate prefix
        rootRouter.use(route.path, router);
        RouterMap.set(rai, rootRouter);
    });
    return async (req, res, next) => {
        /**
         * Now we need to chain two middlewares
         *   1. findRequestRai - which process the coming request and determine which rai to link it to
         *   2. isAuthorized - check wether the current user is authorized to access the found rai
         *
         * if the two middlewares are passed successfully now we need to pass the request to the router designed
         * for that rai.
         */
        try {
            /**
             * 1. Find the RAI for the incoming request
             *    Get the corresponding Router from the RouterMap
             *    If no Router found, throw a RAI_NOT_FOUND error
             */
            const reqRai = (0, findRequestRai_1.findRequestRai)(req, Array.from(RaisMap.values()).map((r) => ({
                path: r.path,
                method: r.method,
                rai: r.rai,
            })));
            /**
             * Retrieve the router for the found RAI
             */
            const router = RouterMap.get(reqRai);
            if (!router) {
                const path = req.originalUrl.split("?")[0];
                const method = req.method;
                // set status code 404
                res.status(404);
                return next(new errors_1.default.RequestError(`No RAI found for the request URL: ${path} with method: ${method}`, {
                    code: "RAI_NOT_FOUND",
                    route: path,
                    method,
                }));
            }
            /**
             * 2. Check if the user is authorized to access this RAI
             *    If not authorized, throw an UNAUTHORIZED error
             */
            const route = RaisMap.get(reqRai);
            const user_roles = req.user?.roles || [guestRole];
            const isAuthorized = route.isAuthorized(user_roles);
            if (!isAuthorized) {
                const path = req.originalUrl.split("?")[0];
                const method = req.method;
                // set status code 403
                res.status(user_roles.length === 1 && user_roles[0] === guestRole ? 401 : 403);
                return next(new errors_1.default.RequestError(`User is not authorized to access the RAI: ${reqRai}`, {
                    code: "UNAUTHORIZED",
                    route: path,
                    method,
                    requiredRoles: route.roles,
                    userRoles: user_roles,
                }));
            }
            return router(req, res, next);
        }
        catch (error) {
            return next(error);
        }
    };
}
exports.default = TheLastMiddleware;
