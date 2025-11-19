import {
  PostmanDescription,
  PostmanAuth,
  PostmanVariableList,
  PostmanEventList,
  PostmanProtocolProfileBehavior,
} from "../types/postman.types";

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
    urlencoded?: Array<{ key: string; value: string; disabled?: boolean }>;
    formdata?: Array<{ key: string; value: string; type?: "text" | "file"; disabled?: boolean }>;
    file?: { src: string };
    graphql?: { query: string; variables?: string };
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
    header?: Array<{ key: string; value: string }>;
    body?: string;
    _postman_previewlanguage?: string;
  }>;
}

/**
 * PostmanForRoute class
 * Configures how a single Route should be represented as a request item in Postman
 */
class PostmanForRoute {
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

  constructor(config: PostmanForRouteConfig) {
    this.name = config.name;
    this.description = config.description;
    this.auth = config.auth;
    this.variable = config.variable;
    this.event = config.event;
    this.protocolProfileBehavior = config.protocolProfileBehavior;
    this.headers = config.headers;
    this.query = config.query;
    this.body = config.body;
    this.response = config.response;
  }

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
    params?: Array<{ path: string; description?: string }>;
  }, baseUrl: string = "{{baseUrl}}"): PostmanItem {
    // Convert Express-style path (/users/:id) to Postman-style path (/users/{{id}})
    const postmanPath = this.convertPathToPostman(route.path);

    // Build URL object
    const url: PostmanUrl = {
      raw: `${baseUrl}${postmanPath}`,
      host: baseUrl.includes("://") ? [baseUrl] : [baseUrl],
      path: postmanPath.split("/").filter(segment => segment !== ""),
    };

    // Add query parameters if configured
    if (this.query) {
      url.query = Object.entries(this.query).map(([key, value]) => ({
        key,
        value,
        disabled: false,
      }));
    }

    // Build headers array
    const headers: Array<{ key: string; value: string; disabled?: boolean }> = [];
    if (this.headers) {
      Object.entries(this.headers).forEach(([key, value]) => {
        headers.push({ key, value, disabled: false });
      });
    }

    // Build request object
    const request: PostmanRequest = {
      method: route.method.toUpperCase(),
      header: headers,
      url,
    };

    // Add body if configured
    if (this.body) {
      request.body = {
        mode: this.body.mode,
        ...(this.body.mode === "raw" && this.body.raw !== undefined
          ? { raw: this.body.raw }
          : {}),
        ...(this.body.mode === "urlencoded" && this.body.urlencoded
          ? { urlencoded: this.body.urlencoded }
          : {}),
        ...(this.body.mode === "formdata" && this.body.formdata
          ? { formdata: this.body.formdata }
          : {}),
        ...(this.body.mode === "file" && this.body.file
          ? { file: this.body.file }
          : {}),
        ...(this.body.mode === "graphql" && this.body.graphql
          ? { graphql: this.body.graphql }
          : {}),
        ...(this.body.options ? { options: this.body.options } : {}),
      };
    }

    // Add auth if configured
    if (this.auth !== undefined) {
      request.auth = this.auth;
    }

    // Build the item
    const item: PostmanItem = {
      name: this.name || route.name,
      request,
    };

    // Add optional properties
    if (this.description !== undefined) {
      item.description = this.description;
    } else if (route.description) {
      item.description = route.description;
    }

    if (this.variable) {
      item.variable = this.variable;
    }

    if (this.event) {
      item.event = this.event;
    }

    if (this.protocolProfileBehavior) {
      item.protocolProfileBehavior = this.protocolProfileBehavior;
    }

    if (this.response) {
      item.response = this.response;
    }

    return item;
  }

  /**
   * Converts Express-style path parameters to Postman-style variables
   * Example: /users/:id/:postId -> /users/{{id}}/{{postId}}
   * @param path Express-style path
   * @returns Postman-style path
   */
  private convertPathToPostman(path: string): string {
    return path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, "{{$1}}");
  }
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
    urlencoded?: Array<{ key: string; value: string; disabled?: boolean }>;
    formdata?: Array<{ key: string; value: string; type?: string; disabled?: boolean }>;
    file?: { src: string };
    graphql?: { query: string; variables?: string };
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
    header?: Array<{ key: string; value: string }>;
    body?: string;
    _postman_previewlanguage?: string;
  }>;
  protocolProfileBehavior?: PostmanProtocolProfileBehavior;
}

export default PostmanForRoute;
