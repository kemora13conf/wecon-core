"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRequestRai = void 0;
const path_to_regexp_1 = require("path-to-regexp");
const errors_1 = require("../../../errors");
/**
 * Middleware to find the request RAI (Role Access Interface) based on the request URL and method.
 * It matches the request URL with the defined RAIs in app.locals. If a match is found, it attaches
 * the RAI object to the request object and calls the next middleware. If no match is found, it
 * returns a 404 error.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
const findRequestRai = async (req, res, next) => {
    try {
        // Access the values of roles and rais from app.locals
        const rais = req.app.locals.rais;
        const route = req.originalUrl.split("?")[0];
        const method = req.method;
        const rai = rais.find((r) => {
            // Add a check to ensure r.path is a string
            if (typeof r.path === "string") {
                const test = (0, path_to_regexp_1.match)(r.path);
                return ((test(route) ||
                    test(route.endsWith("/") ? route.slice(0, -1) : route.concat("/"))) &&
                    r.method?.trim() === method?.trim());
            }
            return false;
        });
        if (rai) {
            req.rai = rai;
            return next();
        }
        else {
            return next(new errors_1.NotFoundRouteError("RAI not found"));
        }
    }
    catch (error) {
        return next(error);
    }
};
exports.findRequestRai = findRequestRai;
