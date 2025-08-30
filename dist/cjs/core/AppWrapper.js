"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PotmanController_1 = __importDefault(require("./PotmanController"));
const findRequestRai_1 = require("../lib/rais/middlewares/findRequestRai");
const isAuthorized_1 = require("../lib/rais/middlewares/isAuthorized");
const rais_1 = require("../lib/rais");
class AppWrapper extends PotmanController_1.default {
    constructor(config) {
        super(config.routes, config.postman);
        this.app = config.app;
        this.routes = config.routes;
        this.roles = config.roles ? config.roles : [];
    }
    getExpressApp(middlewares = [], postMiddlewares = []) {
        /**
         * Seed RAIs & roles in the app.locals
         * This is used to find the RAI for the current request
         * and to check if the user is authorized to access the route
         */
        const { rais } = (0, rais_1.InitializeCreatingRAIs)(this.routes);
        this.app.locals.roles = this.roles?.map((role) => {
            return {
                _id: role,
                name: role,
            };
        });
        this.app.locals.rais = rais;
        this.app.use(findRequestRai_1.findRequestRai, isAuthorized_1.isAuthorized);
        /**
         * Register middlewares
         * These middlewares will be applied to all routes
         *
         * we are doing this because if you register any middlewares
         * after the routes, they will not be executed
         */
        if (middlewares && middlewares.length > 0) {
            middlewares.forEach((middleware) => {
                this.app.use(middleware);
            });
        }
        this.app.use(this.routes.buildRouter());
        /**
         * Register post middlewares
         * These middlewares will be applied after the routes
         */
        if (postMiddlewares && postMiddlewares.length > 0) {
            postMiddlewares.forEach((middleware) => {
                this.app.use(middleware);
            });
        }
        return this.app;
    }
}
exports.default = AppWrapper;
