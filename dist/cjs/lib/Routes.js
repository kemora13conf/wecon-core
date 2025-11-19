"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Route_1 = __importDefault(require("./Route"));
const BaseClass_1 = __importDefault(require("./BaseClass"));
const errors_1 = __importDefault(require("../errors"));
const PostmanForRoutes_1 = __importDefault(require("./PostmanForRoutes"));
class Routes extends BaseClass_1.default {
    constructor(r) {
        super(); // Call the BaseClass constructor
        this.mergeParams = false;
        this.prefix = r.prefix ? r.prefix : "";
        this.routes = r.routes;
        this.params = r.params ? r.params : [];
        this.middlewares = r.middlewares ? r.middlewares : [];
        this.postman = r.postman
            ? r.postman
            : new PostmanForRoutes_1.default({ folderName: "" });
        this.mergeParams = r.mergeParams ? r.mergeParams : false;
        try {
            this.validateRoutes();
        }
        catch (err) {
            const errInfo = this.getCallerInfo();
            this.handleConfigError(err, errInfo);
        }
    }
    validateRoutes() {
        /**
         * 1. Validate the prefix property
         */
        if (this.prefix && typeof this.prefix !== "string") {
            throw new errors_1.default.ConfigError("ROUTES_CONFIG:INVALID_PREFIX_TYPE");
        }
        /**
         * 2. Validate the routes property
         */
        if (!this.routes) {
            throw new errors_1.default.ConfigError("ROUTES_CONFIG:MISSING_ROUTES");
        }
        if (!Array.isArray(this.routes)) {
            throw new Error("ROUTES_CONFIG:INVALID_ROUTES_TYPE");
        }
        /**
         * 3. Validate the middlewares property
         */
        if (this.middlewares && !Array.isArray(this.middlewares)) {
            throw new errors_1.default.ConfigError("ROUTES_CONFIG:INVALID_MIDDLEWARES_TYPE");
        }
        /**
         * 4. Validate params property
         */
        if (this.params && !Array.isArray(this.params)) {
            throw new errors_1.default.ConfigError("ROUTES_CONFIG:INVALID_PARAMS_TYPE");
        }
        /**
         * 5. Validate the mergeParams property
         */
        if (this.mergeParams && typeof this.mergeParams !== "boolean") {
            throw new errors_1.default.ConfigError("ROUTES_CONFIG:INVALID_MERGE_PARAMS_TYPE");
        }
    }
    handleConfigError(err, errInfo) {
        const POSSIBLE_ERRORS = {
            "ROUTES_CONFIG:INVALID_PREFIX_TYPE": {
                title: "Invalid 'prefix' property type",
                details: "The 'prefix' property must be a string, but received: " +
                    typeof this.prefix,
                fix: "Ensure prefix is a string, for example:\n    prefix: '/api' or prefix: ''",
            },
            "ROUTES_CONFIG:MISSING_ROUTES": {
                title: "Missing required 'routes' property",
                details: "The Routes instance requires a 'routes' array to be defined",
                fix: "Add a routes array to your configuration:\n    routes: [new Routes(...), new Route(...)]",
            },
            "ROUTES_CONFIG:INVALID_ROUTES_TYPE": {
                title: "Invalid 'routes' property type",
                details: "The 'routes' property must be an array, but received: " +
                    typeof this.routes,
                fix: "Ensure routes is an array:\n    routes: [...] // not routes: {...}",
            },
            "ROUTES_CONFIG:INVALID_MIDDLEWARES_TYPE": {
                title: "Invalid 'middlewares' property type",
                details: "The 'middlewares' property must be an array of express handlers, but received: " +
                    typeof this.middlewares,
                fix: "Provide an array of middleware functions or an empty array:\n    middlewares: [middleware1, middleware2] or middlewares: []",
            },
            "ROUTES_CONFIG:INVALID_PARAMS_TYPE": {
                title: "Invalid 'params' property type",
                details: "The 'params' property must be an array of RoutesParam instances, but received: " +
                    typeof this.params,
                fix: "Provide an array of RoutesParam instances or an empty array:\n    params: [new RoutesParam(...)] or params: []",
            },
            "ROUTES_CONFIG:INVALID_MERGE_PARAMS_TYPE": {
                title: "Invalid 'mergeParams' property type",
                details: "The 'mergeParams' property must be a boolean, but received: " +
                    typeof this.mergeParams,
                fix: "Set mergeParams to a boolean value, for example:\n    mergeParams: true",
            },
        };
        const errorConfig = POSSIBLE_ERRORS[err.message] || {
            title: err.message,
            details: "An unexpected error occurred",
            fix: "Please check your Routes configuration",
        };
        super.logError(errorConfig, errInfo);
    }
    groupRoutesByRai() {
        const raiMap = new Map();
        const traverse = (current, accumulatedPath, accumulatedParams, accumulatedMiddlewares, parentsMergeParams) => {
            // --- HANDLE ROUTE (Endpoint) ---
            if (current instanceof Route_1.default) {
                const fullPath = accumulatedPath + current.path;
                // Combine accumulated middlewares with route-specific ones
                const finalMiddlewares = [
                    ...accumulatedMiddlewares,
                    ...(current.middlewares || []),
                ];
                // Combine accumulated params
                const finalParams = this.deduplicateParams(accumulatedParams);
                if (raiMap.has(current.rai)) {
                    throw new errors_1.default.ConfigError(`DUPLICATE_RAI:${current.rai}`, {
                        route: current,
                    });
                }
                // Create the flattened route object
                const extendedRoute = Object.assign(Object.create(Object.getPrototypeOf(current)), current, {
                    path: fullPath, // The absolute path (e.g. /api/v1/users/:id)
                    params: finalParams,
                    middlewares: finalMiddlewares,
                });
                raiMap.set(current.rai, extendedRoute);
                return;
            }
            // --- HANDLE ROUTES (Group) ---
            if (current instanceof Routes) {
                const nextPath = accumulatedPath + current.prefix;
                // Middleware Inheritance
                const nextMiddlewares = [
                    ...accumulatedMiddlewares,
                    ...(current.middlewares || []),
                ];
                // Param Inheritance Logic
                let nextParams = [];
                if (parentsMergeParams) {
                    // If merging, take all previous params + current params
                    nextParams = [...accumulatedParams, ...(current.params || [])];
                }
                else {
                    // If NOT merging, strictly take ONLY current params (reset scope)
                    // Unless it's the very first level, but typically mergeParams=false means "block parent params"
                    // However, usually, we keep accumulatedParams if we want path context,
                    // but your logic seemed to want strictly scoped params.
                    // Standard Express behavior: Params are positional.
                    // To match your previous logic:
                    nextParams = current.params || [];
                }
                // Recurse into children
                current.routes.forEach((child) => {
                    traverse(child, nextPath, nextParams, nextMiddlewares, current.mergeParams || false);
                });
            }
        };
        // Start traversal
        traverse(this, "", [], [], false);
        return raiMap;
    }
    deduplicateParams(params) {
        const unique = new Map();
        params.forEach((p) => unique.set(p.path, p));
        return Array.from(unique.values());
    }
    test() {
        throw new Error("Method not implemented.");
    }
}
exports.default = Routes;
