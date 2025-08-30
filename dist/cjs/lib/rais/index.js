"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitializeCreatingRAIs = InitializeCreatingRAIs;
const utils_1 = require("./utils");
function InitializeCreatingRAIs(RoutesInstance) {
    try {
        // Step 1: Extract all routes and parents in a single pass
        const { routes, roles } = (0, utils_1.extractRoutesAndroles)(RoutesInstance.routes, RoutesInstance.prefix);
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
