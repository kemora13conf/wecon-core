"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const Route_1 = __importDefault(require("./lib/Route"));
const Routes_1 = __importDefault(require("./lib/Routes"));
const RoutesParam_1 = __importDefault(require("./lib/RoutesParam"));
const Wecon_1 = __importDefault(require("./lib/Wecon"));
const PostmanForRoute_1 = __importDefault(require("./lib/PostmanForRoute"));
const PostmanForRoutes_1 = __importDefault(require("./lib/PostmanForRoutes"));
const routes = new Routes_1.default({
    prefix: "/user/users",
    mergeParams: true,
    params: [
        new RoutesParam_1.default("userId", (req, res, next, value) => {
            console.log("User ID param value:", value);
            req.userId = value;
            next();
        }),
    ],
    middlewares: [
        async (req, res, next) => {
            console.log("Global middleware for /user/users");
            next();
        },
    ],
    routes: [
        new Route_1.default({
            path: "/:userId",
            method: "GET",
            name: "Get user by ID",
            description: "Fetch a user by their unique ID",
            roles: ["admin", "user", "guest"],
            rai: "user.users:getById",
            middlewares: [
                (req, res) => {
                    res.json({
                        message: `User data for ID: ${req.userId || "unknown"}`,
                    });
                },
            ],
        }),
        new Route_1.default({
            path: "/list",
            method: "GET",
            name: "Get all users",
            description: "Fetch all users from the database",
            roles: ["admin", "user", "guest"],
            rai: "user.users:list",
            middlewares: [
                (req, res) => {
                    res.json({ message: "List of users" });
                },
            ],
        }),
        new Routes_1.default({
            // prefix: "/profile",
            params: [
                new RoutesParam_1.default("userId", (req, res, next, value) => {
                    console.log("Profile ID param value:", value);
                    next();
                }),
            ],
            routes: [
                new Route_1.default({
                    path: "/view",
                    method: "GET",
                    name: "View user profile",
                    description: "View the profile of the logged-in user",
                    roles: ["admin", "user", "guest"],
                    rai: "user.profile:view.me",
                    middlewares: [
                        (req, res) => {
                            res.json({ message: "User profile data" });
                        },
                    ],
                }),
                new Route_1.default({
                    path: "/update",
                    method: "POST",
                    name: "Update user profile",
                    description: "Update the profile of the logged-in user",
                    roles: ["admin", "user"],
                    rai: "user.profile:update.me",
                    middlewares: [
                        (req, res) => {
                            res.json({ message: "User profile updated" });
                        },
                    ],
                }),
            ],
        }),
        new Route_1.default({
            path: "/create",
            method: "POST",
            name: "Create a new user",
            description: "Create a new user in the database",
            roles: ["admin"],
            rai: "user.profile:update",
            middlewares: [
                (req, res) => {
                    res.json({ message: "User created" });
                },
            ],
            postman: new PostmanForRoute_1.default({
                name: "Create User",
                description: "Create a new user with email, name, and role",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer {{authToken}}",
                },
                body: {
                    mode: "raw",
                    raw: JSON.stringify({
                        email: "john.doe@example.com",
                        name: "John Doe",
                        role: "user",
                    }, null, 2),
                    options: {
                        raw: {
                            language: "json",
                        },
                    },
                },
                response: [
                    {
                        name: "Success - User Created",
                        code: 201,
                        status: "Created",
                        _postman_previewlanguage: "json",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: JSON.stringify({
                            success: true,
                            data: {
                                id: "user_123",
                                email: "john.doe@example.com",
                                name: "John Doe",
                                role: "user",
                                createdAt: "2025-11-19T10:30:00Z",
                            },
                        }, null, 2),
                    },
                ],
                event: [
                    {
                        listen: "test",
                        script: {
                            type: "text/javascript",
                            exec: [
                                "pm.test('Status code is 201', function () {",
                                "    pm.response.to.have.status(201);",
                                "});",
                                "",
                                "pm.test('Response has user data', function () {",
                                "    const jsonData = pm.response.json();",
                                "    pm.expect(jsonData.success).to.be.true;",
                                "    pm.expect(jsonData.data).to.have.property('id');",
                                "    pm.expect(jsonData.data).to.have.property('email');",
                                "});",
                            ],
                        },
                    },
                ],
            }),
        }),
    ],
    postman: new PostmanForRoutes_1.default({ folderName: "User Management" }),
});
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
// Use the routes' middleware
const wecon = new Wecon_1.default()
    .routes(routes)
    .roles(["admin", "user", "guest"])
    .guestRole("guest")
    .onRoutesPrepared((routes) => {
    console.log(`Registered ${routes.length} routes`);
})
    .dev({
    debugMode: true,
    helpfulErrors: true,
    logRoutes: true,
})
    .postman({
    name: "Wecon API",
    description: "API documentation generated by Wecon",
    autoGenerate: true,
    output: {
        collection: "./postman_collection.json",
        environment: "./postman_environment.json",
    },
    baseUrl: "http://localhost:3000",
    version: "1.0.0",
})
    .build();
app.use(wecon.handler());
/**
 * Error Handler Middleware
 */
app.use((err, req, res) => {
    console.error("Message:", err.message);
    if (err.meta) {
        console.error("Meta Info:", JSON.stringify(err.meta));
    }
    if (err?.meta?.code === "RAI_NOT_FOUND") {
        res.status(404);
    }
    else {
        res.status(500);
    }
    res.json({ error: err.message, meta: err.meta || null });
});
exports.default = app;
