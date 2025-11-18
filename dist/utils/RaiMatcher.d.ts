import Route from "../lib/Route";
export type RaiRoutesList = Array<Pick<Route, "path" | "method" | "rai">>;
/**
 * RAI Matcher with built-in caching for optimal performance
 */
declare class RaiMatcher {
    private cache;
    private routesByMethod;
    private exactRoutes;
    constructor(raisList: RaiRoutesList);
    /**
     * Pre-compile all route matchers and organize by HTTP method for faster lookup
     */
    private initialize;
    /**
     * Calculate route specificity score (higher = more specific)
     * Static segments score higher than dynamic ones
     */
    private getRouteSpecificity;
    /**
     * Normalize route by handling trailing slashes
     */
    private normalizeRoute;
    /**
     * Find RAI for the given request path and method
     */
    findRai(path: string, method: string): string;
    /**
     * Clear the runtime cache (useful for testing or after route updates)
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        methods: string[];
    };
}
export default RaiMatcher;
