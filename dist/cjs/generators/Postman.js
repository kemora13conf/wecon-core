"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class PostmanGenerator {
    /**
     * Constructs a new instance of the PostmanGenerator class.
     *
     * @param name - The name of the Postman collection. Defaults to the platform name.
     * @param description - An optional description for the Postman collection.
     *
     * Initializes the collection and environment with specified name and description.
     * Sets up the base URL using server configuration and API prefix.
     * Creates a new set to track registered variables.
     */
    constructor(name, description, options) {
        this.baseUrl = options?.baseUrl || '';
        this.variableSet = new Set();
        // Initialize collection
        this.collection = {
            info: {
                name,
                description,
                schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
            },
            item: [],
            variable: [
                {
                    key: 'base_url',
                    value: this.baseUrl,
                    type: 'string',
                    description: 'Base URL for all requests',
                },
            ],
        };
        // Initialize environment
        this.environment = {
            id: this.generateUUID(),
            name: `${name}`,
            values: [
                ...this.collection.variable,
            ],
            _postman_variable_scope: "environment"
        };
    }
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    /**
     * Add an environment variable
     * @param key - Variable key
     * @param value - Variable value
     * @param type - Variable type (string, number, boolean)
     */
    addEnvironmentVariable(key, value, type = 'string') {
        this.environment.values.push({
            key,
            value,
            type,
        });
    }
    /**
     * Add multiple environment variables at once
     * @param variables - Array of environment variables
     */
    addEnvironmentVariables(variables) {
        variables.forEach(variable => {
            this.addEnvironmentVariable(variable.key, variable.value, variable.type || 'string');
        });
    }
    /**
     * Extract variables from a string using Postman's {{variable}} syntax
     * @param text - Text to search for variables
     * @returns Array of variable names found
     */
    extractVariables(text) {
        const variableRegex = /\{\{([^}]+)\}\}/g;
        const matches = text.match(variableRegex);
        if (!matches)
            return [];
        return matches.map(match => match.slice(2, -2).trim());
    }
    /**
     * Extract variables from request URL
     * @param request - Postman request object
     * @returns Array of variable names found
     */
    extractUrlVariables(request) {
        const variables = [];
        if (typeof request.url === 'string') {
            variables.push(...this.extractVariables(request.url));
        }
        else if (request.url && typeof request.url === 'object') {
            // Check URL raw value
            if (request.url.raw) {
                variables.push(...this.extractVariables(request.url.raw));
            }
            // Check path segments
            if (Array.isArray(request.url.path)) {
                request.url.path.forEach((segment) => {
                    if (typeof segment === 'string') {
                        variables.push(...this.extractVariables(segment));
                    }
                });
            }
            // Check query parameters
            if (Array.isArray(request.url.query)) {
                request.url.query.forEach((param) => {
                    if (param.value) {
                        variables.push(...this.extractVariables(param.value));
                    }
                });
            }
        }
        return variables;
    }
    /**
     * Extract variables from request headers
     * @param request - Postman request object
     * @returns Array of variable names found
     */
    extractHeaderVariables(request) {
        const variables = [];
        if (Array.isArray(request.header)) {
            request.header.forEach(header => {
                if (header.value) {
                    variables.push(...this.extractVariables(header.value));
                }
            });
        }
        return variables;
    }
    /**
     * Extract variables from request body
     * @param request - Postman request object
     * @returns Array of variable names found
     */
    extractBodyVariables(request) {
        const variables = [];
        if (request.body) {
            // Handle raw body
            if (request.body.raw) {
                variables.push(...this.extractVariables(request.body.raw));
            }
            // Handle form-data and urlencoded bodies
            if (Array.isArray(request.body.formdata) || Array.isArray(request.body.urlencoded)) {
                const params = request.body.formdata || request.body.urlencoded;
                if (params) {
                    params.forEach((param) => {
                        if (param.value) {
                            variables.push(...this.extractVariables(param.value));
                        }
                    });
                }
            }
        }
        return variables;
    }
    /**
     * Register a variable in both collection and environment
     * @param variableName - Name of the variable to register
     */
    registerVariable(variableName) {
        // Skip if variable is already registered or is 'baseUrl'
        if (this.variableSet.has(variableName) || this.collection.variable.some(v => v.key === variableName)) {
            return;
        }
        // Add to set to prevent duplicates
        this.variableSet.add(variableName);
        // Add to environment
        this.environment.values.push({
            key: variableName,
            value: "", // Empty value by default
            type: "string",
        });
    }
    /**
     * Process a single request item to find and register variables
     * @param request - Postman request object
     */
    processRequestVariables(request) {
        const urlVars = this.extractUrlVariables(request);
        const headerVars = this.extractHeaderVariables(request);
        const bodyVars = this.extractBodyVariables(request);
        // Register all found variables
        [...urlVars, ...headerVars, ...bodyVars].forEach(variable => {
            this.registerVariable(variable);
        });
    }
    /**
     * Recursively process items to find and register variables
     * @param items - Array of route items to process
     */
    processItems(items) {
        items.forEach(item => {
            if (item.item) {
                // If item has subitems, process them recursively
                this.processItems(item.item);
            }
            else if (item.request) {
                // Process single request
                this.processRequestVariables(item.request);
            }
        });
    }
    addCountNumberToRoutes(routes) {
        let _count = 0;
        return routes.map((route) => {
            if (route.item) {
                route.item = this.addCountNumberToRoutes(route.item);
                return route;
            }
            else {
                _count++;
                return {
                    ...route,
                    name: ` ${_count} - ${route.name}`,
                };
            }
        });
    }
    /**
     * Generate Postman collection and register all variables found
     * @param items - Array of route items to include in the collection
     * @returns The complete Postman collection
     */
    generateCollection(items) {
        // Reset variable set before processing
        this.variableSet.clear();
        // Process all items to find variables
        this.processItems(items);
        // Add count numbers to routes
        this.collection.item = this.addCountNumberToRoutes(items);
        this.collection.variable = this.environment.values;
        return this.collection;
    }
    /**
     * Generate the environment configuration
     * @returns The complete Postman environment
     */
    generateEnvironment(items) {
        this.processItems(items); // Process all items to find variables
        return this.environment;
    }
    /**
     * Save the Postman collection to a JSON file
     * @param filePath - Path where the collection file should be saved
     * @param options - File writing options
     */
    saveCollectionToFile(filePath, options = { encoding: 'utf8', flag: 'w' }) {
        fs_1.default.writeFileSync(filePath, JSON.stringify(this.collection, null, 2), options);
    }
    /**
     * Save the Postman environment to a JSON file
     * @param filePath - Path where the environment file should be saved
     * @param options - File writing options
     */
    saveEnvironmentToFile(filePath, options = { encoding: 'utf8', flag: 'w' }) {
        fs_1.default.writeFileSync(filePath, JSON.stringify(this.environment, null, 2), options);
    }
    /**
     * Save both collection and environment files
     * @param collectionPath - Path for collection file
     * @param environmentPath - Path for environment file
     * @param options - File writing options
     */
    saveToFiles(collectionPath, environmentPath, options = { encoding: 'utf8', flag: 'w' }) {
        this.saveCollectionToFile(collectionPath, options);
        this.saveEnvironmentToFile(environmentPath, options);
    }
}
exports.default = PostmanGenerator;
