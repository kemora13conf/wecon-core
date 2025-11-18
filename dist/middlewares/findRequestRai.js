import RaiMatcher from "../utils/RaiMatcher";
// Global matcher instance (singleton pattern)
let raiMatcherInstance = null;
/**
 * Initialize the RAI matcher with routes (call this once during app startup)
 */
export const initializeRaiMatcher = (raisList) => {
    raiMatcherInstance = new RaiMatcher(raisList);
};
/**
 * Middleware to find the request RAI based on the request URL and method.
 * Optimized with caching and efficient route matching.
 *
 * @param {Request} req - The Express request object.
 * @param {Array<Pick<Route, "path" | "method" | "rai">>} RaisList - List of RAIs to match against.
 */
export const findRequestRai = (req, RaisList) => {
    // Initialize matcher if not already done
    if (!raiMatcherInstance) {
        initializeRaiMatcher(RaisList);
    }
    const route = req.originalUrl.split("?")[0];
    const method = req.method;
    const rai = raiMatcherInstance.findRai(route, method);
    return rai;
};
