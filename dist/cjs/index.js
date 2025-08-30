"use strict";
/**
 * RBAC Express Framework
 *
 * A TypeScript framework for building Express.js APIs with built-in
 * role-based access control and Postman documentation generation.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIOError = exports.SocketAuthError = exports.NotFoundRouteError = exports.InvalidRouteError = exports.ApiRouteNotFoundError = exports.PostmanGenerator = exports.isAuthorized = exports.findRequestRai = exports.InitializeCreatingRAIs = exports.Module = exports.ErrorRoute = exports.Routes = exports.Route = exports.AppWrapper = void 0;
// Core exports
const AppWrapper_1 = __importDefault(require("./core/AppWrapper"));
exports.AppWrapper = AppWrapper_1.default;
const Route_1 = __importDefault(require("./core/Route"));
exports.Route = Route_1.default;
const Routes_1 = __importDefault(require("./core/Routes"));
exports.Routes = Routes_1.default;
const ErrorRoute_1 = __importDefault(require("./core/ErrorRoute"));
exports.ErrorRoute = ErrorRoute_1.default;
const Module_1 = __importDefault(require("./core/Module"));
exports.Module = Module_1.default;
// RAI system exports
const rais_1 = require("./lib/rais");
Object.defineProperty(exports, "InitializeCreatingRAIs", { enumerable: true, get: function () { return rais_1.InitializeCreatingRAIs; } });
const findRequestRai_1 = require("./lib/rais/middlewares/findRequestRai");
Object.defineProperty(exports, "findRequestRai", { enumerable: true, get: function () { return findRequestRai_1.findRequestRai; } });
const isAuthorized_1 = require("./lib/rais/middlewares/isAuthorized");
Object.defineProperty(exports, "isAuthorized", { enumerable: true, get: function () { return isAuthorized_1.isAuthorized; } });
// Generator exports
const Postman_1 = __importDefault(require("./generators/Postman"));
exports.PostmanGenerator = Postman_1.default;
// Error exports
const errors_1 = require("./errors");
Object.defineProperty(exports, "ApiRouteNotFoundError", { enumerable: true, get: function () { return errors_1.ApiRouteNotFoundError; } });
Object.defineProperty(exports, "InvalidRouteError", { enumerable: true, get: function () { return errors_1.InvalidRouteError; } });
Object.defineProperty(exports, "NotFoundRouteError", { enumerable: true, get: function () { return errors_1.NotFoundRouteError; } });
Object.defineProperty(exports, "SocketAuthError", { enumerable: true, get: function () { return errors_1.SocketAuthError; } });
Object.defineProperty(exports, "SocketIOError", { enumerable: true, get: function () { return errors_1.SocketIOError; } });
// Default export
exports.default = AppWrapper_1.default;
