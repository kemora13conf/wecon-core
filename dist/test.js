"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppWrapper_1 = __importDefault(require("./core/AppWrapper"));
const Route_1 = __importDefault(require("./core/Route"));
const Routes_1 = __importDefault(require("./core/Routes"));
const express_1 = __importDefault(require("express"));
const userRoutes = new Routes_1.default({
    prefix: "/users",
    params: [
        {
            path: "id",
            method: async (req, res, next, id) => {
                if (!id || !/^\d+$/.test(id)) {
                    return res.status(400).json({ error: "Invalid user ID" });
                }
                return next();
            },
        },
    ],
    routes: [
        new Route_1.default({
            path: "/",
            method: "GET",
            name: "Get all users",
            description: "Fetch all users from the database",
            roles: ["admin", "user"],
            rai: "users:list",
            middlewares: [
                (req, res) => {
                    res.json({ message: "List of users" });
                },
            ],
        }),
    ],
    postman: {
        folderName: "User Management",
    },
});
// Define API routes
const apiRoutes = new Routes_1.default({
    prefix: "/api/v1",
    routes: [userRoutes],
});
// Initialize app wrapper
const appWrapper = new AppWrapper_1.default({
    app: (0, express_1.default)(),
    routes: apiRoutes,
    postman: {
        name: "Example API",
        description: "Example API documentation",
    },
    roles: ["admin", "user", "guest"],
});
appWrapper.generatePostmanCollection("collection.json");
appWrapper.generatePostmanEnvironment("environment.json");
const app = appWrapper.getExpressApp();
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
