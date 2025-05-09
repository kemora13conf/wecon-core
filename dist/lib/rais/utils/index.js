"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractRoutesAndroles = extractRoutesAndroles;
const Route_1 = __importDefault(require("../../../core/Route"));
const Routes_1 = __importDefault(require("../../../core/Routes"));
const errors_1 = require("../../../errors");
function extractRoutesAndroles(routes, prefix = "", depth = 0) {
    const rais = [];
    const roles = new Set();
    for (let i = 0; i < routes.length; i++) {
        if (routes[i] instanceof Routes_1.default) {
            const route = routes[i];
            const newPrefix = (prefix + route.prefix);
            const { routes: nestedRoutes, roles: nestedroles } = extractRoutesAndroles(route.routes, newPrefix, depth + 1);
            rais.push(...nestedRoutes);
            nestedroles.forEach((p) => roles.add(p));
        }
        else if (routes[i] instanceof Route_1.default) {
            const route = routes[i];
            if (!route.roles?.length) {
                throw new errors_1.InvalidRouteError(`
INVALID roles FIELD:
    METHOD : ${prefix + route.method}
    PATH : ${route.path}
    NAME : ${route.name}
    DESCRIPTION : ${route.description}
    RESOURCE : ${route.rai}
        `);
            }
            const rai = {
                _id: route.rai,
                method: route.method,
                path: prefix + route.path,
                name: route.name,
                description: route.description,
                rai: route.rai,
                roles: route.roles,
                children: [],
                isStopped: false,
            };
            rais.push(rai);
            route.roles.forEach((role) => roles.add(role));
        }
    }
    return { routes: rais, roles: Array.from(roles) };
}
