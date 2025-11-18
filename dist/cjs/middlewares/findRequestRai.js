"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRequestRai = exports.initializeRaiMatcher = void 0;
const RaiMatcher_1 = __importDefault(require("../utils/RaiMatcher"));
// Global matcher instance (singleton pattern)
let raiMatcherInstance = null;
/**
 * Initialize the RAI matcher with routes (call this once during app startup)
 */
const initializeRaiMatcher = (raisList) => {
    raiMatcherInstance = new RaiMatcher_1.default(raisList);
};
exports.initializeRaiMatcher = initializeRaiMatcher;
/**
 * Middleware to find the request RAI based on the request URL and method.
 * Optimized with caching and efficient route matching.
 *
 * @param {Request} req - The Express request object.
 * @param {Array<Pick<Route, "path" | "method" | "rai">>} RaisList - List of RAIs to match against.
 */
const findRequestRai = (req, RaisList) => {
    // Initialize matcher if not already done
    if (!raiMatcherInstance) {
        (0, exports.initializeRaiMatcher)(RaisList);
    }
    const route = req.originalUrl.split("?")[0];
    const method = req.method;
    const rai = raiMatcherInstance.findRai(route, method);
    return rai;
};
exports.findRequestRai = findRequestRai;
