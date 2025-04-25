import fs from "fs";
import { PostmanCollection, PostmanEnvironment, PostmanRequest, PostmanRouteItem, SaveOptions } from "../types/postman";

class PostmanGenerator {
    private baseUrl: string;
    private collection: PostmanCollection;
    private environment: PostmanEnvironment;
    private variableSet: Set<string>;

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

    constructor(name: string, description?: string, options?: { baseUrl?: string, version?: string }) {
        this.baseUrl = options?.baseUrl || '';
        this.variableSet = new Set<string>();

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

    private generateUUID(): string {
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
    public addEnvironmentVariable(
        key: string,
        value: string,
        type: string = 'string'
    ): void {
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
    public addEnvironmentVariables(
        variables: Array<{ key: string; value: string; type?: string }>
    ): void {
        variables.forEach(variable => {
            this.addEnvironmentVariable(variable.key, variable.value, variable.type || 'string');
        });
    }

    /**
     * Extract variables from a string using Postman's {{variable}} syntax
     * @param text - Text to search for variables
     * @returns Array of variable names found
     */
    private extractVariables(text: string): string[] {
        const variableRegex = /\{\{([^}]+)\}\}/g;
        const matches = text.match(variableRegex);
        if (!matches) return [];
        return matches.map(match => match.slice(2, -2).trim());
    }

    /**
     * Extract variables from request URL
     * @param request - Postman request object
     * @returns Array of variable names found
     */
    private extractUrlVariables(request: PostmanRequest): string[] {
        const variables: string[] = [];

        if (typeof request.url === 'string') {
            variables.push(...this.extractVariables(request.url));
        } else if (request.url && typeof request.url === 'object') {
            // Check URL raw value
            if (request.url.raw) {
                variables.push(...this.extractVariables(request.url.raw));
            }

            // Check path segments
            if (Array.isArray(request.url.path)) {
                request.url.path.forEach((segment: string | number) => {
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
    private extractHeaderVariables(request: PostmanRequest): string[] {
        const variables: string[] = [];

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
    private extractBodyVariables(request: PostmanRequest): string[] {
        const variables: string[] = [];

        if (request.body) {
            // Handle raw body
            if (request.body.raw) {
                variables.push(...this.extractVariables(request.body.raw));
            }

            // Handle form-data and urlencoded bodies
            if (Array.isArray(request.body.formdata) || Array.isArray(request.body.urlencoded)) {
                const params = request.body.formdata || request.body.urlencoded;
                if (params) {
                    params.forEach((param: { value: string }) => {
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
    private registerVariable(variableName: string): void {
        // Skip if variable is already registered or is 'baseUrl'
        if (this.variableSet.has(variableName) || this.collection.variable.some(v => v.key === variableName)) {
            return;
        }

        // Add to set to prevent duplicates
        this.variableSet.add(variableName);

        // Add to environment
        this.environment.values.push({
            key: variableName,
            value: "",  // Empty value by default
            type: "string",
        });
    }

    /**
     * Process a single request item to find and register variables
     * @param request - Postman request object
     */
    private processRequestVariables(request: PostmanRequest): void {
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
    private processItems(items: PostmanRouteItem[]): void {
        items.forEach(item => {
            if (item.item) {
                // If item has subitems, process them recursively
                this.processItems(item.item);
            } else if (item.request) {
                // Process single request
                this.processRequestVariables(item.request);
            }
        });
    }

    private addCountNumberToRoutes(routes: PostmanRouteItem[]): PostmanRouteItem[] {
        let _count = 0;
        return routes.map((route: PostmanRouteItem) => {
            if (route.item) {
                route.item = this.addCountNumberToRoutes(route.item);
                return route;
            } else {
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
    public generateCollection(items: PostmanRouteItem[]): PostmanCollection {
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
    public generateEnvironment(items: PostmanRouteItem[]): PostmanEnvironment {
        this.processItems(items); // Process all items to find variables
        return this.environment;
    }

    /**
     * Save the Postman collection to a JSON file
     * @param filePath - Path where the collection file should be saved
     * @param options - File writing options
     */
    public saveCollectionToFile(
        filePath: string,
        options: SaveOptions = { encoding: 'utf8', flag: 'w' }
    ): void {
        fs.writeFileSync(
            filePath,
            JSON.stringify(this.collection, null, 2),
            options
        );
    }

    /**
     * Save the Postman environment to a JSON file
     * @param filePath - Path where the environment file should be saved
     * @param options - File writing options
     */
    public saveEnvironmentToFile(
        filePath: string,
        options: SaveOptions = { encoding: 'utf8', flag: 'w' }
    ): void {
        fs.writeFileSync(
            filePath,
            JSON.stringify(this.environment, null, 2),
            options
        );
    }

    /**
     * Save both collection and environment files
     * @param collectionPath - Path for collection file
     * @param environmentPath - Path for environment file
     * @param options - File writing options
     */
    public saveToFiles(
        collectionPath: string,
        environmentPath: string,
        options: SaveOptions = { encoding: 'utf8', flag: 'w' }
    ): void {
        this.saveCollectionToFile(collectionPath, options);
        this.saveEnvironmentToFile(environmentPath, options);
    }
}

export default PostmanGenerator;