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
import Routes from '../lib/Routes';
import { PostmanInfo, PostmanVariableList, PostmanAuth, PostmanEventList, PostmanProtocolProfileBehavior } from '../types/postman.types';
/**
 * Configuration for PostmanGenerator
 */
export interface PostmanGeneratorConfig {
    /** Name of the Postman collection */
    name: string;
    /** Description of the API */
    description?: string;
    /** Base URL for all requests (will be added as {{baseUrl}} variable) */
    baseUrl?: string;
    /** API version */
    version?: string;
    /** Output file paths */
    output?: {
        /** Path to save the collection JSON file */
        collection?: string;
        /** Path to save the environment JSON file */
        environment?: string;
    };
}
/**
 * Postman Collection v2.1.0 structure
 */
interface PostmanCollection {
    info: PostmanInfo;
    item: (PostmanItemGroup | PostmanItem)[];
    auth?: PostmanAuth | null;
    event?: PostmanEventList;
    variable?: PostmanVariableList;
    protocolProfileBehavior?: PostmanProtocolProfileBehavior;
}
/**
 * Postman Item (single request)
 */
interface PostmanItem {
    name: string;
    id?: string;
    description?: string | {
        content?: string;
        type?: string;
    };
    request: PostmanRequest | string;
    response?: unknown[];
    event?: PostmanEventList;
    variable?: PostmanVariableList;
    protocolProfileBehavior?: PostmanProtocolProfileBehavior;
}
/**
 * Postman Item Group (folder)
 */
interface PostmanItemGroup {
    name: string;
    description?: string | {
        content?: string;
        type?: string;
    };
    item: (PostmanItem | PostmanItemGroup)[];
    auth?: PostmanAuth | null;
    event?: PostmanEventList;
    variable?: PostmanVariableList;
    protocolProfileBehavior?: PostmanProtocolProfileBehavior;
}
/**
 * Postman Request structure
 */
interface PostmanRequest {
    method: string;
    header?: Array<{
        key: string;
        value: string;
        disabled?: boolean;
    }>;
    body?: {
        mode: string;
        raw?: string;
        urlencoded?: Array<{
            key: string;
            value: string;
            disabled?: boolean;
        }>;
        formdata?: Array<{
            key: string;
            value: string;
            type?: string;
            disabled?: boolean;
        }>;
        file?: {
            src: string;
        };
        graphql?: {
            query: string;
            variables?: string;
        };
        options?: {
            raw?: {
                language?: string;
            };
        };
    };
    url: PostmanUrl | string;
    auth?: PostmanAuth | null;
    description?: string | {
        content?: string;
        type?: string;
    };
}
/**
 * Postman URL structure
 */
interface PostmanUrl {
    raw: string;
    protocol?: string;
    host?: string | string[];
    port?: string;
    path?: string | string[];
    query?: Array<{
        key: string;
        value: string;
        disabled?: boolean;
        description?: string | {
            content?: string;
            type?: string;
        };
    }>;
    hash?: string;
    variable?: PostmanVariableList;
}
/**
 * Postman Environment structure
 */
interface PostmanEnvironment {
    id?: string;
    name: string;
    values: Array<{
        key: string;
        value: string;
        type?: 'default' | 'secret';
        enabled?: boolean;
        description?: string;
    }>;
    _postman_variable_scope?: string;
    _postman_exported_at?: string;
    _postman_exported_using?: string;
}
/**
 * PostmanGenerator class
 */
declare class PostmanGenerator {
    private config;
    private routes;
    private collectedVariables;
    private pathVariables;
    constructor(config: PostmanGeneratorConfig, routes: Routes);
    /**
     * Generate both collection and environment files
     */
    generate(): Promise<{
        collection: PostmanCollection;
        environment: PostmanEnvironment;
    }>;
    /**
     * Extract variables from all routes and their configurations
     */
    private extractVariables;
    /**
     * Recursively extract variables from Routes instances
     */
    private extractVariablesFromRoutes;
    /**
     * Extract path parameters from Express-style path
     * Example: /users/:userId/posts/:postId -> ['userId', 'postId']
     */
    private extractPathParams;
    /**
     * Extract variable references from strings (e.g., {{authToken}})
     */
    private extractVariablesFromString;
    /**
     * Generate the Postman Collection
     */
    private generateCollection;
    /**
     * Convert Routes/Route instances to Postman items/folders
     */
    private convertRoutesToItems;
    /**
     * Convert a single Route to a PostmanItem
     */
    private convertRouteToItem;
    /**
     * Convert Express-style path to Postman-style path
     * Example: /users/:userId -> /users/{{userId}}
     */
    private convertPathToPostman;
    /**
     * Generate the Postman Environment
     */
    private generateEnvironment;
    /**
     * Write JSON to file with pretty formatting
     */
    private writeJsonFile;
    /**
     * Static helper to generate from Wecon configuration
     */
    static generateFromWecon(config: PostmanGeneratorConfig, routes: Routes): Promise<{
        collection: PostmanCollection;
        environment: PostmanEnvironment;
    }>;
}
export default PostmanGenerator;
