"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthorized = void 0;
const errors_1 = require("../../../errors");
const isAuthorized = async (req, res, next) => {
    try {
        // Get the current user roles
        const u_roles = [];
        if (req.user && Array.isArray(req.user.roles)) {
            u_roles.push(...req.user.roles);
        }
        else {
            u_roles.push("guest");
        }
        // Access the values of roles from app.locals
        const roles = (req.app.locals.roles || []).filter((role) => u_roles.includes(role.name));
        /**
         * This middleware should be executed after the findRequestRai middleware
         * so the rai object should be available in the request object
         */
        const rai = req.rai;
        if (!rai) {
            return next(new errors_1.ApiRouteNotFoundError("RAI not found"));
        }
        // Check if the user has the access to the rai by his roles
        const isAuthorized = rai.roles.some((role) => roles.some((r) => r._id === role));
        if (!isAuthorized) {
            return next(new errors_1.ApiRouteNotFoundError("Unauthorized access"));
        }
        return next();
    }
    catch (error) {
        return next(error);
    }
    return next();
};
exports.isAuthorized = isAuthorized;
