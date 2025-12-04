import { RequestParamHandler } from "express";
import { v4 as uuidv4 } from "uuid";
import ErrorCatcher from "./ErrorCatcher";
import { ErrorTraceType, PossibleErrosType } from "../types";
import errors from "../errors";

class RoutesParam extends ErrorCatcher {
  readonly uuidv4: string;
  public path: string;
  public middleware: RequestParamHandler;
  validate?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    validatorFn?: (value: string) => boolean;
  };

  constructor(
    path: string,
    middleware: RequestParamHandler,
    validate?: {
      pattern?: RegExp;
      minLength?: number;
      maxLength?: number;
      validatorFn?: (value: string) => boolean;
    }
  ) {
    super(); // Call the ErrorCatcher constructor

    this.uuidv4 = uuidv4();
    this.path = path;
    this.middleware = middleware;
    this.validate = validate;

    try {
      this.validateParam();
    } catch (err) {
      const errInfo = this.getCallerInfo();
      this.handleConfigError(err as Error, errInfo);
    }
  }

  private validateParam(): void {
    /**
     * 1. Validate the path property
     */
    if (!this.path) {
      throw new errors.ConfigError("ROUTES_PARAM:MISSING_PATH");
    }

    /**
     * 2. Validate the middleware property
     */
    if (!this.middleware) {
      throw new errors.ConfigError("ROUTES_PARAM:MISSING_MIDDLEWARE");
    }

    /**
     * 3. Validate the validate object if provided
     */
    if (this.validate) {
      /**
       * 3.1. If validate is provided, ensure it's an object
       */
      if (typeof this.validate !== "object" || Array.isArray(this.validate)) {
        throw new errors.ConfigError("ROUTES_PARAM:INVALID_VALIDATE_TYPE");
      }

      /**
       * 3.2. If validate.pattern is provided, ensure it's a RegExp
       */
      if (this.validate.pattern && !(this.validate.pattern instanceof RegExp)) {
        throw new errors.ConfigError("ROUTES_PARAM:INVALID_PATTERN_TYPE");
      }

      /**
       * 3.3. If validate.minLength is provided, ensure it's a number
       */
      if (
        this.validate.minLength !== undefined &&
        typeof this.validate.minLength !== "number"
      ) {
        throw new errors.ConfigError("ROUTES_PARAM:INVALID_MIN_LENGTH_TYPE");
      }

      /**
       * 3.4. If validate.maxLength is provided, ensure it's a number
       */
      if (
        this.validate.maxLength !== undefined &&
        typeof this.validate.maxLength !== "number"
      ) {
        throw new errors.ConfigError("ROUTES_PARAM:INVALID_MAX_LENGTH_TYPE");
      }

      /**
       * 3.5. If validate.validatorFn is provided, ensure it's a function
       */
      if (
        this.validate.validatorFn &&
        typeof this.validate.validatorFn !== "function"
      ) {
        throw new errors.ConfigError("ROUTES_PARAM:INVALID_VALIDATOR_FN_TYPE");
      }
    }
  }

  private handleConfigError(err: Error, errInfo: ErrorTraceType): void {
    const POSSIBLE_ERRORS: PossibleErrosType = {
      "ROUTES_PARAM:INVALID_VALIDATE_TYPE": {
        title: "Invalid 'validate' property type",
        details:
          "The 'validate' property must be an object, but received: " +
          typeof this.validate,
        fix: "Ensure validate is an object:\n    validate: { pattern: /regex/, minLength: 3 }\n    validate: { validatorFn: (value) => boolean }",
      },
      "ROUTES_PARAM:MISSING_PATH": {
        title: "Missing required 'path' parameter",
        details: "The RoutesParam instance requires a 'path' to be defined",
        fix: "Provide a path parameter when creating RoutesParam:\n    new RoutesParam('userId', middleware)",
      },
      "ROUTES_PARAM:MISSING_MIDDLEWARE": {
        title: "Missing required 'middleware' parameter",
        details:
          "The RoutesParam instance requires a 'middleware' function to be defined",
        fix: "Provide a middleware function as the second parameter:\n    new RoutesParam('userId', (req, res, next, id) => { /* handler */ })",
      },
      "ROUTES_PARAM:INVALID_PATTERN_TYPE": {
        title: "Invalid 'validate.pattern' property type",
        details:
          "The 'validate.pattern' property must be a RegExp, but received: " +
          typeof this.validate?.pattern,
        fix: "Ensure pattern is a RegExp:\n    validate: { pattern: /^[0-9]+$/ }",
      },
      "ROUTES_PARAM:INVALID_MIN_LENGTH_TYPE": {
        title: "Invalid 'validate.minLength' property type",
        details:
          "The 'validate.minLength' property must be a number, but received: " +
          typeof this.validate?.minLength,
        fix: "Ensure minLength is a number:\n    validate: { minLength: 3 }",
      },
      "ROUTES_PARAM:INVALID_MAX_LENGTH_TYPE": {
        title: "Invalid 'validate.maxLength' property type",
        details:
          "The 'validate.maxLength' property must be a number, but received: " +
          typeof this.validate?.maxLength,
        fix: "Ensure maxLength is a number:\n    validate: { maxLength: 50 }",
      },
      "ROUTES_PARAM:INVALID_VALIDATOR_FN_TYPE": {
        title: "Invalid 'validate.validatorFn' property type",
        details:
          "The 'validate.validatorFn' property must be a function, but received: " +
          typeof this.validate?.validatorFn,
        fix: "Ensure validatorFn is a function:\n    validate: { validatorFn: (value) => value.startsWith('user-') }",
      },
    };

    const errorConfig = POSSIBLE_ERRORS[err.message] || {
      title: err.message,
      details: "An unexpected error occurred",
      fix: "Please check your RoutesParam configuration",
    };

    super.logError(errorConfig, errInfo);
  }
  validateValue(value: string): boolean {
    if (!this.validate) {
      return true; // No validation rules, so it's valid
    }

    /**
     * Check pattern
     */
    if (this.validate.pattern && !this.validate.pattern.test(value)) {
      return false;
    }

    /**
     * Check minLength
     */
    if (
      this.validate.minLength !== undefined &&
      value.length < this.validate.minLength
    ) {
      return false;
    }

    /**
     * Check maxLength
     */
    if (
      this.validate.maxLength !== undefined &&
      value.length > this.validate.maxLength
    ) {
      return false;
    }

    /**
     * Check validatorFn
     */
    if (this.validate.validatorFn && !this.validate.validatorFn(value)) {
      return false;
    }

    return true; // Passed all validations
  }
}

export default RoutesParam;
