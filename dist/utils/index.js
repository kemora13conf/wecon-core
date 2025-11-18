import { match } from "path-to-regexp";
/**
 * Path to RAI matcher utility
 * @function pathToRaiMatcher
 * @param { PTRMConfig } config - Configuration object containing path and method
 * @returns { RAI | null } - Returns the matched RAI or null if no match is found
 */
export function pathToRaiMatcher(config) {
    /**
     * Before proceeding. We need to understand first what this function does
     * and the kind of edge cases we need to handle.
     *
     * This function takes a path and method as input and tries to match it
     * against a list of RAIs (Resource Access Identifier) defined in the config.
     * If a match is found, it returns the corresponding RAI.
     *
     * Edge cases to consider:
     * 1. Trailing slashes in the path
     * 2. Case sensitivity of the path
     * 3. Query parameters in the path
     * 4. Different HTTP methods
     * 5. Overlapping paths
     * 6. No match found
     */
    const { path, method, rais } = config;
    for (const r of rais) {
        if (r.method.trim() === method.trim()) {
            /**
             * Remove the trailing slash for matching
             * from both the request path and the RAI path
             */
            const formattedPath = path.endsWith("/") ? path.slice(0, -1) : path;
            const formattedRaiPath = r.path.endsWith("/") ? r.path.slice(0, -1) : r.path;
            const test = match(formattedRaiPath); // Create a matcher for the RAI path
            const matched = test(formattedPath); // Test the formatted request path
            if (matched) {
                return r.rai; // Return the matched RAI
            }
        }
    }
    return null;
}
