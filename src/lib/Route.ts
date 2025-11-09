/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handler, RequestHandler } from "express";
import { v4 as uuidv4 } from "uuid";
import { RouteConfig } from "../types";
import Module from "./Module";
import BaseClass from "./BaseClass";
import chalk from "chalk";

class Route<T = any> extends BaseClass {
  module?: Module<T>;
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  middlewares: Handler[] | RequestHandler[] | any[];
  name: string;
  description: string;
  rai: string;
  roles: string[];
  postman?: RouteConfig["postman"];

  constructor(r: RouteConfig) {
    super(); // Call the BaseClass constructor

    this.id = uuidv4();
    this.method = r.method;
    this.path = r.path;
    this.middlewares = r.middlewares;
    this.name = r.name ? r.name : `[${this.method}] ${this.path}`;
    this.description = r.description ? r.description : "";
    this.rai = r.rai;
    this.roles = r.roles;
    this.postman = r.postman
      ? r.postman
      : { headers: [], body: {}, params: [] };

    try {
      this.validateRoute();
    } catch (err) {
      const errInfo = this.getCallerInfo();
      this.handleConfigError(err as Error, errInfo);
    }
  }

  private validateRoute(): void {
    if (!this.method) {
      throw new Error("MISSING_METHOD");
    }
    if (!this.path) {
      throw new Error("MISSING_PATH");
    }
    if (!this.rai) {
      throw new Error("MISSING_RAI");
    }
    if (!this.roles) {
      throw new Error("MISSING_ROLES");
    }
    if (!Array.isArray(this.middlewares)) {
      throw new Error("INVALID_MIDDLEWARES_TYPE");
    }
  }

  private handleConfigError(
    err: Error,
    errInfo: {
      file: string;
      line: number;
      column: number;
    }
  ): void {
    const errorMessages: Record<
      string,
      { title: string; details: string; fix: string }
    > = {
      MISSING_METHOD: {
        title: "Missing required 'method' property",
        details: "The Route instance requires a 'method' to be defined",
        fix: "Add a method to your route configuration:\n    method: 'GET' | 'POST' | 'PUT' | 'DELETE'",
      },
      MISSING_PATH: {
        title: "Missing required 'path' property",
        details: "The Route instance requires a 'path' to be defined",
        fix: "Add a path to your route configuration:\n    path: '/users/:id'",
      },
      MISSING_RAI: {
        title: "Missing required 'rai' property",
        details:
          "The Route instance requires a unique 'rai' (Route Access Identifier) to be defined",
        fix: "Add a rai to your route configuration:\n    rai: 'users:read' // Must be unique across all routes",
      },
      MISSING_ROLES: {
        title: "Missing required 'roles' property",
        details: "The Route instance requires a 'roles' array to be defined",
        fix: "Add roles to your route configuration:\n    roles: ['admin', 'user'] // or roles: ['guest'] for public routes",
      },
      INVALID_MIDDLEWARES_TYPE: {
        title: "Invalid 'middlewares' property type",
        details:
          "The 'middlewares' property must be an array, but received: " +
          typeof this.middlewares,
        fix: "Ensure middlewares is an array:\n    middlewares: [authMiddleware, validateMiddleware] // or middlewares: []",
      },
    };

    const errorConfig = errorMessages[err.message] || {
      title: err.message,
      details: "An unexpected error occurred",
      fix: "Please check your Route configuration",
    };

    console.error(
      chalk.red.bold(
        "\n╔══════════════════════════════════════════════════════════╗"
      ),
      chalk.red.bold("\n║") +
        chalk.white.bold(
          "  Route Configuration Error                            "
        ) +
        chalk.red.bold("   ║"),
      chalk.red.bold(
        "\n╚══════════════════════════════════════════════════════════╝\n"
      )
    );

    console.error(chalk.red.bold("✖ Error:"), chalk.white(errorConfig.title));
    console.error(chalk.gray("\n  Details:"), chalk.white(errorConfig.details));
    console.error(
      chalk.gray("\n  Location:"),
      chalk.cyan(`${errInfo.file}:${errInfo.line}:${errInfo.column}`)
    );
    console.error(chalk.yellow.bold("\n  💡 How to fix:"));
    console.error(chalk.yellow(`  ${errorConfig.fix.replace(/\n/g, "\n  ")}`));
    console.error(""); // Empty line for spacing

    // exit the process with failure
    process.exit(1);
  }
}

export default Route;
