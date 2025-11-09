import { RequestParamHandler } from "express";
import { v4 as uuidv4 } from "uuid";

class RoutesParam {
  readonly uuidv4: string;
  readonly path: string;
  readonly middleware: RequestParamHandler;
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
    this.uuidv4 = uuidv4();
    this.path = path;
    this.middleware = middleware;
    this.validate = validate;

    /**
     * If no path is provided, throw an error
     */
    if (!this.path) {
      throw new Error("RoutesParam instance must have a path");
    }

    /**
     * If no middleware is provided, throw an error
     */
    if (!this.middleware) {
      throw new Error("RoutesParam instance must have a middleware");
    }

    /**
     * Validation checks
     * _________________
     */
    if (this.validate) {
      /**
       * 1. If validate.pattern is provided, ensure it's a RegExp
       */
      if (this.validate.pattern && !(this.validate.pattern instanceof RegExp)) {
        // TODO : Create a custom error class for validation errors
        throw new Error("validate.pattern must be a RegExp");
      }

      /**
       * 2. If validate.minLength is provided, ensure it's a number
       */
      if (
        this.validate.minLength &&
        typeof this.validate.minLength !== "number"
      ) {
        throw new Error("validate.minLength must be a number");
      }

      /**
       * 3. If validate.maxLength is provided, ensure it's a number
       */
      if (
        this.validate.maxLength &&
        typeof this.validate.maxLength !== "number"
      ) {
        throw new Error("validate.maxLength must be a number");
      }

      /**
       * 4. If validate.validatorFn is provided, ensure it's a function
       */
      if (
        this.validate.validatorFn &&
        typeof this.validate.validatorFn !== "function"
      ) {
        throw new Error("validate.validatorFn must be a function");
      }
    }
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
