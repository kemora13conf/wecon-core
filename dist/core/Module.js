"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Module {
    constructor({ routes, config = {} }) {
        if (!routes) {
            throw new Error("Module name and version are required");
        }
        this.routes = routes;
        this.config = config;
    }
}
exports.default = Module;
