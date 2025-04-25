import AppWrapper from "./core/AppWrapper";
import Route from "./core/Route";
import Routes from "./core/Routes";
import express from "express";

const userRoutes = new Routes({
    prefix: '/users',
    params: [{
        name: 'id',
        middleware: (req, res, next) => {
            const id = req.params.id;
            if (!id || !/^\d+$/.test(id)) {
                return res.status(400).json({ error: 'Invalid user ID' });
            }
            next();
        }
    }],
    routes: [
        new Route({
            path: '/',
            method: 'get',
            roles: ['admin', 'user'],
            rai: 'users:list',
            middlewares: [
                // Example middleware for authentication
                (req, res, next) => {
                    const token = req.headers.authorization;
                    if (!token) {
                        return res.status(401).json({ error: 'Unauthorized' });
                    }
                    next();
                }
            ],
            query: {
                page: {
                    type: 'number',
                    required: false,
                    description: 'Page number for pagination'
                },
                limit: {
                    type: 'number',
                    required: false,
                    description: 'Number of items per page'
                }
            }
        }),
        new Route({
            path: '/:id',
            method: 'get',
            roles: ['admin', 'user'],
            rai: 'users:get',
            query: {
                fields: {
                    type: 'string',
                    required: false,
                    description: 'Comma-separated list of fields to return'
                }
            }
        }),
        new Route({
            path: '/',
            method: 'post',
            roles: ['admin'],
            rai: 'users:create',
            body: {
                username: {
                    type: 'string',
                    required: true,
                    description: 'User\'s username'
                },
                email: {
                    type: 'string',
                    required: true,
                    description: 'User\'s email address'
                },
                role: {
                    type: 'string',
                    required: true,
                    description: 'User\'s role'
                }
            }
        })
    ],
    postman: {
        folderName: 'User Management',
        description: 'APIs for managing users',
        auth: {
            type: 'bearer',
            token: {
                key: 'Authorization',
                value: 'Bearer {{token}}',
                description: 'Authentication token'
            }
        },
        variables: [
            {
                key: 'token',
                value: 'your-token-here',
                description: 'Authentication token'
            }
        ]
    }
});

// Define API routes
const apiRoutes = new Routes({
    prefix: '/api/v1',
    routes: [userRoutes]
});

// Initialize app wrapper
const appWrapper = new AppWrapper({
    express: express(),
    routes: apiRoutes,
    postman: {
        name: 'Example API',
        description: 'Example API documentation'
    }
});

const app = appWrapper.getExpress();
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
}
);