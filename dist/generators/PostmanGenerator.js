/**
 * PostmanGenerator - Intelligent Postman Collection & Environment Generator
 *
 * This utility class generates:
 * 1. Postman Collection v2.1.0 JSON files
 * 2. Postman Environment JSON files with auto-extracted variables
 *
 * Features:
 * - Automatic variable extraction from route paths (e.g., :userId -> {{userId}})
 * - Collection of custom variables from PostmanForRoute and PostmanForRoutes configs
 * - Hierarchical folder structure matching Routes organization
 * - Smart defaults for missing configurations
 */
import { writeFileSync } from 'fs';
import { dirname } from 'path';
import { mkdirSync } from 'fs';
import Route from '../lib/Route';
import Routes from '../lib/Routes';
/**
 * PostmanGenerator class
 */
class PostmanGenerator {
    constructor(config, routes) {
        this.collectedVariables = new Map();
        this.pathVariables = new Set();
        this.config = config;
        this.routes = routes;
    }
    /**
     * Generate both collection and environment files
     */
    async generate() {
        // Extract all variables from routes
        this.extractVariables();
        // Generate collection
        const collection = this.generateCollection();
        // Generate environment
        const environment = this.generateEnvironment();
        // Write files if output paths specified
        if (this.config.output?.collection) {
            this.writeJsonFile(this.config.output.collection, collection);
        }
        if (this.config.output?.environment) {
            this.writeJsonFile(this.config.output.environment, environment);
        }
        return { collection, environment };
    }
    /**
     * Extract variables from all routes and their configurations
     */
    extractVariables() {
        // Add baseUrl as a variable
        if (this.config.baseUrl) {
            this.collectedVariables.set('baseUrl', {
                key: 'baseUrl',
                value: this.config.baseUrl,
                type: 'string',
                description: 'Base URL for all API requests',
            });
        }
        // Recursively extract variables from routes
        this.extractVariablesFromRoutes(this.routes);
    }
    /**
     * Recursively extract variables from Routes instances
     */
    extractVariablesFromRoutes(routes, parentPath = '') {
        if (routes instanceof Route) {
            // Extract path parameters (e.g., :userId)
            const pathParams = this.extractPathParams(routes.path);
            pathParams.forEach(param => this.pathVariables.add(param));
            // Extract variables from PostmanForRoute config
            if (routes.postman) {
                if (routes.postman.variable) {
                    routes.postman.variable.forEach(variable => {
                        const key = variable.key || variable.id;
                        if (key && !this.collectedVariables.has(key)) {
                            this.collectedVariables.set(key, variable);
                        }
                    });
                }
                // Extract variables from query params
                if (routes.postman.query) {
                    Object.keys(routes.postman.query).forEach(key => {
                        if (!this.collectedVariables.has(key)) {
                            this.collectedVariables.set(key, {
                                key,
                                value: routes.postman.query[key],
                                type: 'string',
                            });
                        }
                    });
                }
                // Extract variables from headers (like {{authToken}})
                if (routes.postman.headers) {
                    Object.values(routes.postman.headers).forEach(headerValue => {
                        const variables = this.extractVariablesFromString(headerValue);
                        variables.forEach(varName => {
                            if (!this.collectedVariables.has(varName)) {
                                this.collectedVariables.set(varName, {
                                    key: varName,
                                    value: '',
                                    type: 'string',
                                    description: `Extracted from headers`,
                                });
                            }
                        });
                    });
                }
                // Extract variables from body
                if (routes.postman.body?.raw) {
                    const variables = this.extractVariablesFromString(routes.postman.body.raw);
                    variables.forEach(varName => {
                        if (!this.collectedVariables.has(varName)) {
                            this.collectedVariables.set(varName, {
                                key: varName,
                                value: '',
                                type: 'string',
                                description: `Extracted from request body`,
                            });
                        }
                    });
                }
            }
        }
        else if (routes instanceof Routes) {
            const currentPath = parentPath + routes.prefix;
            // Extract variables from PostmanForRoutes config
            if (routes.postman) {
                if (routes.postman.variable) {
                    routes.postman.variable.forEach(variable => {
                        const key = variable.key || variable.id;
                        if (key && !this.collectedVariables.has(key)) {
                            this.collectedVariables.set(key, variable);
                        }
                    });
                }
            }
            // Recursively process child routes
            routes.routes.forEach(childRoute => {
                this.extractVariablesFromRoutes(childRoute, currentPath);
            });
        }
    }
    /**
     * Extract path parameters from Express-style path
     * Example: /users/:userId/posts/:postId -> ['userId', 'postId']
     */
    extractPathParams(path) {
        const matches = path.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g);
        if (!matches)
            return [];
        return matches.map(match => match.slice(1)); // Remove the ':' prefix
    }
    /**
     * Extract variable references from strings (e.g., {{authToken}})
     */
    extractVariablesFromString(str) {
        const matches = str.match(/\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g);
        if (!matches)
            return [];
        return matches.map(match => match.slice(2, -2)); // Remove {{ and }}
    }
    /**
     * Generate the Postman Collection
     */
    generateCollection() {
        const collection = {
            info: {
                name: this.config.name,
                description: this.config.description || '',
                version: this.config.version || '1.0.0',
                schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
            },
            item: [],
        };
        // Convert Routes to Postman items
        collection.item = this.convertRoutesToItems(this.routes);
        // Add collection-level variables
        const collectionVars = Array.from(this.collectedVariables.values());
        if (collectionVars.length > 0) {
            collection.variable = collectionVars;
        }
        return collection;
    }
    /**
     * Convert Routes/Route instances to Postman items/folders
     */
    convertRoutesToItems(routes) {
        const items = [];
        if (routes instanceof Route) {
            // Convert single Route to PostmanItem
            const item = this.convertRouteToItem(routes);
            items.push(item);
        }
        else if (routes instanceof Routes) {
            // Check if this Routes instance should be a folder
            const shouldBeFolder = routes.postman?.folderName || routes.prefix;
            if (shouldBeFolder) {
                // Create a folder (item group)
                const folder = {
                    name: routes.postman?.folderName || routes.prefix || 'Routes',
                    item: [],
                };
                // Add description if provided
                if (routes.postman?.description) {
                    folder.description = routes.postman.description;
                }
                // Add auth if provided
                if (routes.postman?.auth !== undefined) {
                    folder.auth = routes.postman.auth;
                }
                // Add events if provided
                if (routes.postman?.event) {
                    folder.event = routes.postman.event;
                }
                // Add variables if provided
                if (routes.postman?.variable) {
                    folder.variable = routes.postman.variable;
                }
                // Add protocol profile behavior if provided
                if (routes.postman?.protocolProfileBehavior) {
                    folder.protocolProfileBehavior = routes.postman.protocolProfileBehavior;
                }
                // Convert child routes
                routes.routes.forEach(childRoute => {
                    const childItems = this.convertRoutesToItems(childRoute);
                    folder.item.push(...childItems);
                });
                items.push(folder);
            }
            else {
                // No folder, just flatten the children
                routes.routes.forEach(childRoute => {
                    const childItems = this.convertRoutesToItems(childRoute);
                    items.push(...childItems);
                });
            }
        }
        return items;
    }
    /**
     * Convert a single Route to a PostmanItem
     */
    convertRouteToItem(route) {
        const baseUrl = this.config.baseUrl || '{{baseUrl}}';
        // Use PostmanForRoute's toPostmanItem if configured
        if (route.postman) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const generatedItem = route.postman.toPostmanItem(route, baseUrl);
            // Convert the item to match our internal structure, normalizing types
            const item = {
                name: generatedItem.name,
                request: generatedItem.request,
            };
            // Normalize description (PostmanDescription can be null, but we want undefined)
            if (generatedItem.description !== null && generatedItem.description !== undefined) {
                item.description = generatedItem.description;
            }
            // Add optional properties if they exist
            if (generatedItem.event)
                item.event = generatedItem.event;
            if (generatedItem.variable)
                item.variable = generatedItem.variable;
            if (generatedItem.response)
                item.response = generatedItem.response;
            if (generatedItem.protocolProfileBehavior) {
                item.protocolProfileBehavior = generatedItem.protocolProfileBehavior;
            }
            return item;
        }
        // Otherwise, generate a basic item
        const postmanPath = this.convertPathToPostman(route.path);
        const item = {
            name: route.name || `[${route.method}] ${route.path}`,
            request: {
                method: route.method.toUpperCase(),
                header: [],
                url: {
                    raw: `${baseUrl}${postmanPath}`,
                    host: baseUrl.includes('://') ? [baseUrl] : [baseUrl],
                    path: postmanPath.split('/').filter(segment => segment !== ''),
                },
            },
        };
        // Add description if available
        if (route.description) {
            item.description = route.description;
        }
        return item;
    }
    /**
     * Convert Express-style path to Postman-style path
     * Example: /users/:userId -> /users/{{userId}}
     */
    convertPathToPostman(path) {
        return path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, '{{$1}}');
    }
    /**
     * Generate the Postman Environment
     */
    generateEnvironment() {
        const environment = {
            name: `${this.config.name} - Environment`,
            values: [],
            _postman_variable_scope: 'environment',
            _postman_exported_at: new Date().toISOString(),
            _postman_exported_using: 'Wecon PostmanGenerator',
        };
        // Add collected variables
        this.collectedVariables.forEach(variable => {
            environment.values.push({
                key: variable.key || variable.id || '',
                value: String(variable.value || ''),
                type: 'default',
                enabled: !variable.disabled,
                description: typeof variable.description === 'string'
                    ? variable.description
                    : variable.description?.content,
            });
        });
        // Add path variables (from :param) with empty values
        this.pathVariables.forEach(paramName => {
            if (!this.collectedVariables.has(paramName)) {
                environment.values.push({
                    key: paramName,
                    value: '',
                    type: 'default',
                    enabled: true,
                    description: `Path parameter extracted from route`,
                });
            }
        });
        return environment;
    }
    /**
     * Write JSON to file with pretty formatting
     */
    writeJsonFile(filePath, data) {
        try {
            // Ensure directory exists
            const dir = dirname(filePath);
            mkdirSync(dir, { recursive: true });
            // Write file
            writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`✓ Generated Postman file: ${filePath}`);
        }
        catch (error) {
            console.error(`✗ Failed to write Postman file: ${filePath}`, error);
            throw error;
        }
    }
    /**
     * Static helper to generate from Wecon configuration
     */
    static async generateFromWecon(config, routes) {
        const generator = new PostmanGenerator(config, routes);
        return generator.generate();
    }
}
export default PostmanGenerator;
