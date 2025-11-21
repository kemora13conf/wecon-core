/**
 * OpenApiGenerator - Intelligent OpenAPI 3.0.0 Specification Generator
 *
 * This utility class generates OpenAPI v3.0.0 JSON files from Wecon routes.
 *
 * Features:
 * - Automatic path parameter extraction (e.g., :userId -> {userId})
 * - Automatic tag generation from route prefixes or configs
 * - recursive route traversal
 * - Smart defaults for missing configurations
 */

import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import Route from "../lib/Route";
import Routes from "../lib/Routes";
import {
  OpenApiConfig,
  OpenApiPathItem,
  OpenApiOperation,
  OpenApiParameter,
  WeconOpenApiConfig,
} from "../types/openapi.types";

class OpenApiGenerator {
  private config: WeconOpenApiConfig;
  private routes: Routes;
  private paths: Record<string, OpenApiPathItem> = {};
  private tags: Set<string> = new Set();

  constructor(config: WeconOpenApiConfig, routes: Routes) {
    this.config = config;
    this.routes = routes;
  }

  /**
   * Generate OpenAPI specification
   */
  public async generate(): Promise<OpenApiConfig> {
    // Recursively process all routes
    this.processRoutes(this.routes);

    // Construct the final OpenAPI object
    const openApi: OpenApiConfig = {
      openapi: "3.0.0",
      info: {
        title: this.config.title,
        description: this.config.description,
        version: this.config.version || "1.0.0",
        ...this.config.info,
      },
      servers: this.config.servers || [],
      paths: this.paths,
      components: {
        securitySchemes: this.config.securitySchemes,
      },
    };

    // Write to file if output path is provided
    if (this.config.output) {
      this.writeJsonFile(this.config.output, openApi);
    }

    return openApi;
  }

  /**
   * Recursively process Routes and Route instances
   */
  private processRoutes(
    routes: Routes | Route,
    parentPath: string = "",
    parentTags: string[] = []
  ): void {
    if (routes instanceof Route) {
      this.addRouteToPaths(routes, parentPath, parentTags);
    } else if (routes instanceof Routes) {
      const currentPath = parentPath + routes.prefix;
      const currentTags = [...parentTags];

      // Add tag from group config if present
      if (routes.openapi?.tag) {
        currentTags.push(routes.openapi.tag);
        this.tags.add(routes.openapi.tag);
      }

      // Recursively process child routes
      routes.routes.forEach((childRoute) => {
        this.processRoutes(childRoute, currentPath, currentTags);
      });
    }
  }

  /**
   * Add a single Route to the paths object
   */
  private addRouteToPaths(
    route: Route,
    parentPath: string,
    parentTags: string[]
  ): void {
    const fullPath = `${parentPath}${route.path}`;
    const openApiPath = this.convertPathToOpenApi(fullPath);

    // Initialize path item if it doesn't exist
    if (!this.paths[openApiPath]) {
      this.paths[openApiPath] = {};
    }

    const pathItem = this.paths[openApiPath];
    const method = route.method.toLowerCase() as keyof Pick<
      OpenApiPathItem,
      "get" | "put" | "post" | "delete"
    >;

    // Extract path parameters
    const pathParams = this.extractPathParams(fullPath);
    const parameters: OpenApiParameter[] = pathParams.map((param) => ({
      name: param,
      in: "path",
      required: true,
      schema: { type: "string" },
    }));

    // Merge with user-defined parameters
    if (route.openapi?.parameters) {
      // We need to handle potential OpenApiReference here, but for simplicity in this generator
      // we'll assume they are mostly direct objects or let the user handle refs.
      // Ideally, we should merge them intelligently.
      // For now, we append user params.
      // Note: In a real scenario, we might want to deduplicate by name.
    }

    const operation: OpenApiOperation = {
      summary: route.openapi?.summary || route.name,
      description: route.openapi?.description || route.description,
      operationId: route.openapi?.operationId || route.id,
      tags: route.openapi?.tags
        ? [...parentTags, ...route.openapi.tags]
        : parentTags,
      parameters: [
        ...parameters,
        ...(route.openapi?.parameters || []),
      ],
      responses: route.openapi?.responses || {
        "200": {
          description: "Successful response",
        },
      },
      security: route.openapi?.security,
      deprecated: route.openapi?.deprecated,
      requestBody: route.openapi?.requestBody,
    };

    // Assign operation to path item
    pathItem[method] = operation;
  }

  /**
   * Convert Express-style path to OpenAPI-style path
   * Example: /users/:userId -> /users/{userId}
   */
  private convertPathToOpenApi(path: string): string {
    return path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, "{$1}");
  }

  /**
   * Extract path parameters from Express-style path
   */
  private extractPathParams(path: string): string[] {
    const matches = path.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g);
    if (!matches) return [];
    return matches.map((match) => match.slice(1)); // Remove the ':' prefix
  }

  /**
   * Write JSON to file with pretty formatting
   */
  private writeJsonFile(filePath: string, data: unknown): void {
    try {
      const dir = dirname(filePath);
      mkdirSync(dir, { recursive: true });
      writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      console.log(`✓ Generated OpenAPI spec: ${filePath}`);
    } catch (error) {
      console.error(`✗ Failed to write OpenAPI file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Static helper to generate from Wecon configuration
   */
  public static async generateFromWecon(
    config: WeconOpenApiConfig,
    routes: Routes
  ): Promise<OpenApiConfig> {
    const generator = new OpenApiGenerator(config, routes);
    return generator.generate();
  }
}

export default OpenApiGenerator;
