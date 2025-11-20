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

import { writeFileSync } from "fs";
import { dirname } from "path";
import { mkdirSync } from "fs";
import Route from "../lib/Route";
import Routes from "../lib/Routes";
import {
  PostmanInfo,
  PostmanVariable,
  PostmanVariableList,
  PostmanAuth,
  PostmanEventList,
  PostmanProtocolProfileBehavior,
} from "../types/postman.types";

// so we can easily change schema version in the future
const SCHEMA_URL =
  "https://schema.getpostman.com/json/collection/v2.1.0/collection.json";

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
  description?: string | { content?: string; type?: string };
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
  description?: string | { content?: string; type?: string };
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
  header?: Array<{ key: string; value: string; disabled?: boolean }>;
  body?: {
    mode: string;
    raw?: string;
    urlencoded?: Array<{ key: string; value: string; disabled?: boolean }>;
    formdata?: Array<{
      key: string;
      value: string;
      type?: string;
      disabled?: boolean;
    }>;
    file?: { src: string };
    graphql?: { query: string; variables?: string };
    options?: { raw?: { language?: string } };
  };
  url: PostmanUrl | string;
  auth?: PostmanAuth | null;
  description?: string | { content?: string; type?: string };
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
    description?: string | { content?: string; type?: string };
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
    type?: "default" | "secret";
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
class PostmanGenerator {
  private config: PostmanGeneratorConfig;
  private routes: Routes;
  private collectedVariables: Map<string, PostmanVariable> = new Map();
  private pathVariables: Set<string> = new Set();

  constructor(config: PostmanGeneratorConfig, routes: Routes) {
    this.config = config;
    this.routes = routes;
  }

  /**
   * Generate both collection and environment files
   */
  public async generate(): Promise<{
    collection: PostmanCollection;
    environment: PostmanEnvironment;
  }> {
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
  private extractVariables(): void {
    // Add baseUrl as a variable
    if (this.config.baseUrl) {
      this.collectedVariables.set("baseUrl", {
        key: "baseUrl",
        value: this.config.baseUrl,
        type: "string",
        description: "Base URL for all API requests",
      });
    }

    // Recursively extract variables from routes
    this.extractVariablesFromRoutes(this.routes);
  }

  /**
   * Recursively extract variables from Routes instances
   */
  private extractVariablesFromRoutes(
    routes: Routes | Route,
    parentPath: string = ""
  ): void {
    if (routes instanceof Route) {
      // Extract path parameters (e.g., :userId)
      const pathParams = this.extractPathParams(routes.path);
      pathParams.forEach((param) => this.pathVariables.add(param));

      // Extract variables from PostmanForRoute config
      if (routes.postman) {
        if (routes.postman.variable) {
          routes.postman.variable.forEach((variable) => {
            const key = variable.key || variable.id;
            if (key && !this.collectedVariables.has(key)) {
              this.collectedVariables.set(key, variable);
            }
          });
        }

        // Extract variables from query params
        if (routes.postman.query) {
          Object.keys(routes.postman.query).forEach((key) => {
            if (!this.collectedVariables.has(key)) {
              this.collectedVariables.set(key, {
                key,
                value: routes.postman!.query![key],
                type: "string",
              });
            }
          });
        }

        // Extract variables from headers (like {{authToken}})
        if (routes.postman.headers) {
          Object.values(routes.postman.headers).forEach((headerValue) => {
            const variables = this.extractVariablesFromString(headerValue);
            variables.forEach((varName) => {
              if (!this.collectedVariables.has(varName)) {
                this.collectedVariables.set(varName, {
                  key: varName,
                  value: "",
                  type: "string",
                  description: `Extracted from headers`,
                });
              }
            });
          });
        }

        // Extract variables from body
        if (routes.postman.body?.raw) {
          const variables = this.extractVariablesFromString(
            routes.postman.body.raw
          );
          variables.forEach((varName) => {
            if (!this.collectedVariables.has(varName)) {
              this.collectedVariables.set(varName, {
                key: varName,
                value: "",
                type: "string",
                description: `Extracted from request body`,
              });
            }
          });
        }
      }
    } else if (routes instanceof Routes) {
      const currentPath = parentPath + routes.prefix;

      // Extract variables from PostmanForRoutes config
      if (routes.postman) {
        if (routes.postman.variable) {
          routes.postman.variable.forEach((variable) => {
            const key = variable.key || variable.id;
            if (key && !this.collectedVariables.has(key)) {
              this.collectedVariables.set(key, variable);
            }
          });
        }
      }

      // Recursively process child routes
      routes.routes.forEach((childRoute) => {
        this.extractVariablesFromRoutes(childRoute, currentPath);
      });
    }
  }

  /**
   * Extract path parameters from Express-style path
   * Example: /users/:userId/posts/:postId -> ['userId', 'postId']
   */
  private extractPathParams(path: string): string[] {
    const matches = path.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g);
    if (!matches) return [];
    return matches.map((match) => match.slice(1)); // Remove the ':' prefix
  }

  /**
   * Extract variable references from strings (e.g., {{authToken}})
   */
  private extractVariablesFromString(str: string): string[] {
    const matches = str.match(/\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g);
    if (!matches) return [];
    return matches.map((match) => match.slice(2, -2)); // Remove {{ and }}
  }

  /**
   * Generate the Postman Collection
   */
  private generateCollection(): PostmanCollection {
    const collection: PostmanCollection = {
      info: {
        name: this.config.name,
        description: this.config.description || "",
        version: this.config.version || "1.0.0",
        schema: SCHEMA_URL,
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
  private convertRoutesToItems(
    routes: Routes | Route,
    parentPrefix: string = ""
  ): (PostmanItem | PostmanItemGroup)[] {
    const items: (PostmanItem | PostmanItemGroup)[] = [];

    if (routes instanceof Route) {
      routes.path = `${parentPrefix}${routes.path}`;
      // Convert single Route to PostmanItem
      const item = this.convertRouteToItem(routes);
      items.push(item);
    } else if (routes instanceof Routes) {
      // Check if this Routes instance should be a folder
      const shouldBeFolder = routes.postman?.folderName || routes.prefix;

      if (shouldBeFolder) {
        // Create a folder (item group)
        const folder: PostmanItemGroup = {
          name: routes.postman?.folderName || routes.prefix || "Routes",
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
          folder.protocolProfileBehavior =
            routes.postman.protocolProfileBehavior;
        }
        console.log(" prefix ===> ", parentPrefix + routes.prefix);

        // Convert child routes
        routes.routes.forEach((childRoute) => {
          const childItems = this.convertRoutesToItems(
            childRoute,
            parentPrefix + routes.prefix
          );
          folder.item.push(...childItems);
        });

        items.push(folder);
      } else {
        // No folder, just flatten the children
        routes.routes.forEach((childRoute) => {
          const childItems = this.convertRoutesToItems(
            childRoute,
            parentPrefix + routes.prefix
          );
          items.push(...childItems);
        });
      }
    }

    return items;
  }

  /**
   * Convert a single Route to a PostmanItem
   */
  private convertRouteToItem(route: Route): PostmanItem {
    const baseUrl = this.config.baseUrl || "{{baseUrl}}";

    // Use PostmanForRoute's toPostmanItem if configured
    if (route.postman) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const generatedItem = route.postman.toPostmanItem(route, baseUrl) as any;
      // Convert the item to match our internal structure, normalizing types
      const item: PostmanItem = {
        name: generatedItem.name,
        request: generatedItem.request,
      };

      // Normalize description (PostmanDescription can be null, but we want undefined)
      if (
        generatedItem.description !== null &&
        generatedItem.description !== undefined
      ) {
        item.description = generatedItem.description;
      }

      // Add optional properties if they exist
      if (generatedItem.event) item.event = generatedItem.event;
      if (generatedItem.variable) item.variable = generatedItem.variable;
      if (generatedItem.response) item.response = generatedItem.response;
      if (generatedItem.protocolProfileBehavior) {
        item.protocolProfileBehavior = generatedItem.protocolProfileBehavior;
      }

      return item;
    }

    // Otherwise, generate a basic item
    const postmanPath = this.convertPathToPostman(route.path);

    const item: PostmanItem = {
      name: route.name || `[${route.method}] ${route.path}`,
      request: {
        method: route.method.toUpperCase(),
        header: [],
        url: {
          raw: `${baseUrl}${postmanPath}`,
          host: baseUrl.includes("://") ? [baseUrl] : [baseUrl],
          path: postmanPath.split("/").filter((segment) => segment !== ""),
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
  private convertPathToPostman(path: string): string {
    return path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, "{{$1}}");
  }

  /**
   * Generate the Postman Environment
   */
  private generateEnvironment(): PostmanEnvironment {
    const environment: PostmanEnvironment = {
      name: `${this.config.name} - Environment`,
      values: [],
      _postman_variable_scope: "environment",
      _postman_exported_at: new Date().toISOString(),
      _postman_exported_using: "Wecon PostmanGenerator",
    };

    // Add collected variables
    this.collectedVariables.forEach((variable) => {
      environment.values.push({
        key: variable.key || variable.id || "",
        value: String(variable.value || ""),
        type: "default",
        enabled: !variable.disabled,
        description:
          typeof variable.description === "string"
            ? variable.description
            : variable.description?.content,
      });
    });

    // Add path variables (from :param) with empty values
    this.pathVariables.forEach((paramName) => {
      if (!this.collectedVariables.has(paramName)) {
        environment.values.push({
          key: paramName,
          value: "",
          type: "default",
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
  private writeJsonFile(filePath: string, data: unknown): void {
    try {
      // Ensure directory exists
      const dir = dirname(filePath);
      mkdirSync(dir, { recursive: true });

      // Write file
      writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      console.log(`✓ Generated Postman file: ${filePath}`);
    } catch (error) {
      console.error(`✗ Failed to write Postman file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Static helper to generate from Wecon configuration
   */
  public static async generateFromWecon(
    config: PostmanGeneratorConfig,
    routes: Routes
  ): Promise<{
    collection: PostmanCollection;
    environment: PostmanEnvironment;
  }> {
    const generator = new PostmanGenerator(config, routes);
    return generator.generate();
  }
}

export default PostmanGenerator;
