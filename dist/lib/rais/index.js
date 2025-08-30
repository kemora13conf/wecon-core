import { extractRoutesAndroles } from "./utils";
export function InitializeCreatingRAIs(RoutesInstance) {
    try {
        // Step 1: Extract all routes and parents in a single pass
        const { routes, roles } = extractRoutesAndroles(RoutesInstance.routes, RoutesInstance.prefix);
        // Step 2: Return the extracted routes and roles
        return {
            rais: routes,
            roles,
        };
    }
    catch (error) {
        console.error("Error during rai seeding:", error);
        throw error;
    }
}
