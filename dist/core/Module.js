"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Routes_1 = __importDefault(require("./Routes"));
class Module {
    constructor(config) {
        if (!config.routes) {
            throw new Error("Module name and version are required");
        }
        /**
         * All the required fields must be given
         * throw an error if not
         */
        if (!config.name) {
            throw new Error("Module name is required");
        }
        if (!config.routes) {
            throw new Error("Module routes are required");
        }
        if (!config.config) {
            throw new Error("Module config is required");
        }
        if (!(config.routes instanceof Routes_1.default)) {
            throw new Error("Module routes must be an instance of Routes");
        }
        if (config.bootstrap &&
            (typeof config.bootstrap !== "function" ||
                config.bootstrap instanceof Promise)) {
            throw new Error("Module bootstrap must be a function");
        }
        this.name = config.name;
        this.config = config.config;
        this.bootstrap = config.bootstrap;
        this.i18n = config.i18n ? config.i18n : {};
        // Ensure routes have a module reference
        this.addModuleToAllRoutes(config.routes);
        this.routes = config.routes;
    }
    addModuleToAllRoutes(routes) {
        routes.registerModule(this);
    }
}
exports.default = Module;
