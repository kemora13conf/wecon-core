import { PostmanCollection, PostmanEnvironment, PostmanRouteItem, SaveOptions } from "../types/postman";
declare class PostmanGenerator {
    private baseUrl;
    private collection;
    private environment;
    private variableSet;
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
    constructor(name: string, description?: string, options?: {
        baseUrl?: string;
        version?: string;
    });
    private generateUUID;
    /**
     * Add an environment variable
     * @param key - Variable key
     * @param value - Variable value
     * @param type - Variable type (string, number, boolean)
     */
    addEnvironmentVariable(key: string, value: string, type?: string): void;
    /**
     * Add multiple environment variables at once
     * @param variables - Array of environment variables
     */
    addEnvironmentVariables(variables: Array<{
        key: string;
        value: string;
        type?: string;
    }>): void;
    /**
     * Extract variables from a string using Postman's {{variable}} syntax
     * @param text - Text to search for variables
     * @returns Array of variable names found
     */
    private extractVariables;
    /**
     * Extract variables from request URL
     * @param request - Postman request object
     * @returns Array of variable names found
     */
    private extractUrlVariables;
    /**
     * Extract variables from request headers
     * @param request - Postman request object
     * @returns Array of variable names found
     */
    private extractHeaderVariables;
    /**
     * Extract variables from request body
     * @param request - Postman request object
     * @returns Array of variable names found
     */
    private extractBodyVariables;
    /**
     * Register a variable in both collection and environment
     * @param variableName - Name of the variable to register
     */
    private registerVariable;
    /**
     * Process a single request item to find and register variables
     * @param request - Postman request object
     */
    private processRequestVariables;
    /**
     * Recursively process items to find and register variables
     * @param items - Array of route items to process
     */
    private processItems;
    private addCountNumberToRoutes;
    /**
     * Generate Postman collection and register all variables found
     * @param items - Array of route items to include in the collection
     * @returns The complete Postman collection
     */
    generateCollection(items: PostmanRouteItem[]): PostmanCollection;
    /**
     * Generate the environment configuration
     * @returns The complete Postman environment
     */
    generateEnvironment(items: PostmanRouteItem[]): PostmanEnvironment;
    /**
     * Save the Postman collection to a JSON file
     * @param filePath - Path where the collection file should be saved
     * @param options - File writing options
     */
    saveCollectionToFile(filePath: string, options?: SaveOptions): void;
    /**
     * Save the Postman environment to a JSON file
     * @param filePath - Path where the environment file should be saved
     * @param options - File writing options
     */
    saveEnvironmentToFile(filePath: string, options?: SaveOptions): void;
    /**
     * Save both collection and environment files
     * @param collectionPath - Path for collection file
     * @param environmentPath - Path for environment file
     * @param options - File writing options
     */
    saveToFiles(collectionPath: string, environmentPath: string, options?: SaveOptions): void;
}
export default PostmanGenerator;
