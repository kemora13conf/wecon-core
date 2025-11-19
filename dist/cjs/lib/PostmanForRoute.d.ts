import { PostmanDescription, PostmanAuth, PostmanVariableList, PostmanEventList, PostmanProtocolProfileBehavior } from "../types/postman.types";
/**
 * Configuration for PostmanForRoute
 * Represents a single request item in a Postman collection
 */
export interface PostmanForRouteConfig {
    /** Item name - overrides the auto-generated name from Route */
    name?: string;
    /** Item description */
    description?: PostmanDescription;
    /** Authentication configuration for this request (overrides parent auth) */
    auth?: PostmanAuth | null;
    /** Variables scoped to this request */
    variable?: PostmanVariableList;
    /** Pre-request and test scripts for this request */
    event?: PostmanEventList;
    /** Protocol profile behavior configuration */
    protocolProfileBehavior?: PostmanProtocolProfileBehavior;
    /** Request headers as key-value pairs */
    headers?: Record<string, string>;
    /** Query parameters as key-value pairs */
    query?: Record<string, string>;
    /** Request body configuration */
    body?: {
        mode: "raw" | "urlencoded" | "formdata" | "file" | "graphql";
        raw?: string;
        urlencoded?: Array<{
            key: string;
            value: string;
            disabled?: boolean;
        }>;
        formdata?: Array<{
            key: string;
            value: string;
            type?: "text" | "file";
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
                language?: "json" | "javascript" | "html" | "xml" | "text";
            };
        };
    };
    /** Sample responses for this request */
    response?: Array<{
        name: string;
        originalRequest?: unknown;
        status?: string;
        code?: number;
        header?: Array<{
            key: string;
            value: string;
        }>;
        body?: string;
        _postman_previewlanguage?: string;
    }>;
}
/**
 * PostmanForRoute class
 * Configures how a single Route should be represented as a request item in Postman
 */
declare class PostmanForRoute {
    name?: string;
    description?: PostmanDescription;
    auth?: PostmanAuth | null;
    variable?: PostmanVariableList;
    event?: PostmanEventList;
    protocolProfileBehavior?: PostmanProtocolProfileBehavior;
    headers?: Record<string, string>;
    query?: Record<string, string>;
    body?: PostmanForRouteConfig["body"];
    response?: PostmanForRouteConfig["response"];
    constructor(config: PostmanForRouteConfig);
    /**
     * Converts this PostmanForRoute configuration into a Postman collection item
     * @param route The Route instance to generate the Postman item for
     * @param baseUrl Optional base URL for the collection (e.g., "{{baseUrl}}" or "http://localhost:3000")
     * @returns Postman collection item object
     */
    toPostmanItem(route: {
        method: string;
        path: string;
        name: string;
        description: string;
        rai: string;
        params?: Array<{
            path: string;
            description?: string;
        }>;
    }, baseUrl?: string): PostmanItem;
    /**
     * Converts Express-style path parameters to Postman-style variables
     * Example: /users/:id/:postId -> /users/{{id}}/{{postId}}
     * @param path Express-style path
     * @returns Postman-style path
     */
    private convertPathToPostman;
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
        description?: PostmanDescription;
    }>;
    hash?: string;
    variable?: PostmanVariableList;
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
        description?: PostmanDescription;
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
    description?: PostmanDescription;
    proxy?: unknown;
    certificate?: unknown;
}
/**
 * Postman Item structure (represents a single request)
 */
interface PostmanItem {
    id?: string;
    name: string;
    description?: PostmanDescription;
    variable?: PostmanVariableList;
    event?: PostmanEventList;
    request: PostmanRequest | string;
    response?: Array<{
        name: string;
        originalRequest?: unknown;
        status?: string;
        code?: number;
        header?: Array<{
            key: string;
            value: string;
        }>;
        body?: string;
        _postman_previewlanguage?: string;
    }>;
    protocolProfileBehavior?: PostmanProtocolProfileBehavior;
}
export default PostmanForRoute;
