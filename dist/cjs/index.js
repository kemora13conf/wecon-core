"use strict";
/**
 * RBAC Express Framework
 *
 * A TypeScript framework for building Express.js APIs with built-in
 * role-based access control and Postman documentation generation.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestError = exports.ConfigError = exports.PostmanGenerator = exports.PostmanForRoutes = exports.PostmanForRoute = exports.Routes = exports.Route = exports.TheLastMiddleware = void 0;
// Core exports
const Wecon_1 = __importDefault(require("./lib/Wecon"));
exports.TheLastMiddleware = Wecon_1.default;
const Route_1 = __importDefault(require("./lib/Route"));
exports.Route = Route_1.default;
const Routes_1 = __importDefault(require("./lib/Routes"));
exports.Routes = Routes_1.default;
const PostmanForRoute_1 = __importDefault(require("./lib/PostmanForRoute"));
exports.PostmanForRoute = PostmanForRoute_1.default;
const PostmanForRoutes_1 = __importDefault(require("./lib/PostmanForRoutes"));
exports.PostmanForRoutes = PostmanForRoutes_1.default;
// Generator exports
const PostmanGenerator_1 = __importDefault(require("./generators/PostmanGenerator"));
exports.PostmanGenerator = PostmanGenerator_1.default;
// Export all Postman schema types
__exportStar(require("./types/postman.types"), exports);
// Error exports
const ConfigError_1 = __importDefault(require("./errors/ConfigError"));
exports.ConfigError = ConfigError_1.default;
const RequestError_1 = __importDefault(require("./errors/RequestError"));
exports.RequestError = RequestError_1.default;
// Default export
exports.default = Wecon_1.default;
