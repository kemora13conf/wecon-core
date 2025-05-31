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
        this.name = config.name;
        this.routes = config.routes;
        this.config = config.config;
        this.bootstrap = config.bootstrap;
        /**
         * All the required fields must be given
         * throw an error if not
         */
        if (!this.name) {
            throw new Error("Module name is required");
        }
        if (!this.routes) {
            throw new Error("Module routes are required");
        }
        if (!this.config) {
            throw new Error("Module config is required");
        }
        if (!(this.routes instanceof Routes_1.default)) {
            throw new Error("Module routes must be an instance of Routes");
        }
        if (this.bootstrap &&
            (typeof this.bootstrap !== "function" ||
                this.bootstrap instanceof Promise)) {
            throw new Error("Module bootstrap must be a function");
        }
        // Register the module to all routes
        this.addModuleToAllRoutes();
    }
    addModuleToAllRoutes() {
        this.routes.registerModule(this);
    }
}
exports.default = Module;
