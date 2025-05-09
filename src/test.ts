import AppWrapper from "./core/AppWrapper";
import Route from "./core/Route";
import Routes from "./core/Routes";
import express, { NextFunction, Request, Response } from "express";

const userRoutes = new Routes({
    prefix: "/users",
    params: [
        {
            path: "id",
            method: async (
                req: Request,
                res: Response,
                next: NextFunction,
                id: string
            ) => {
                if (!id || !/^\d+$/.test(id)) {
                    return res.status(400).json({ error: "Invalid user ID" });
                }
                return next();
            },
        },
    ],
    routes: [
        new Route({
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
const apiRoutes = new Routes({
    prefix: "/api/v1",
    routes: [userRoutes],
});

// Initialize app wrapper
const appWrapper = new AppWrapper({
    app: express(),
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
