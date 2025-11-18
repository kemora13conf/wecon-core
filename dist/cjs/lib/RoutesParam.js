"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const BaseClass_1 = __importDefault(require("./BaseClass"));
const errors_1 = __importDefault(require("../errors"));
class RoutesParam extends BaseClass_1.default {
    constructor(path, middleware, validate) {
        super(); // Call the BaseClass constructor
        this.uuidv4 = (0, uuid_1.v4)();
        this.path = path;
        this.middleware = middleware;
        this.validate = validate;
        try {
            this.validateParam();
        }
        catch (err) {
            const errInfo = this.getCallerInfo();
            this.handleConfigError(err, errInfo);
        }
    }
    validateParam() {
        /**
         * 1. Validate the path property
         */
        if (!this.path) {
            throw new errors_1.default.ConfigError("ROUTES_PARAM:MISSING_PATH");
        }
        /**
         * 2. Validate the middleware property
         */
        if (!this.middleware) {
            throw new errors_1.default.ConfigError("ROUTES_PARAM:MISSING_MIDDLEWARE");
        }
        /**
         * 3. Validate the validate object if provided
         */
        if (this.validate) {
            /**
             * 3.1. If validate is provided, ensure it's an object
             */
            if (typeof this.validate !== "object" || Array.isArray(this.validate)) {
                throw new errors_1.default.ConfigError("ROUTES_PARAM:INVALID_VALIDATE_TYPE");
            }
            /**
             * 3.2. If validate.pattern is provided, ensure it's a RegExp
             */
            if (this.validate.pattern && !(this.validate.pattern instanceof RegExp)) {
                throw new errors_1.default.ConfigError("ROUTES_PARAM:INVALID_PATTERN_TYPE");
            }
            /**
             * 3.3. If validate.minLength is provided, ensure it's a number
             */
            if (this.validate.minLength !== undefined &&
                typeof this.validate.minLength !== "number") {
                throw new errors_1.default.ConfigError("ROUTES_PARAM:INVALID_MIN_LENGTH_TYPE");
            }
            /**
             * 3.4. If validate.maxLength is provided, ensure it's a number
             */
            if (this.validate.maxLength !== undefined &&
                typeof this.validate.maxLength !== "number") {
                throw new errors_1.default.ConfigError("ROUTES_PARAM:INVALID_MAX_LENGTH_TYPE");
            }
            /**
             * 3.5. If validate.validatorFn is provided, ensure it's a function
             */
            if (this.validate.validatorFn &&
                typeof this.validate.validatorFn !== "function") {
                throw new errors_1.default.ConfigError("ROUTES_PARAM:INVALID_VALIDATOR_FN_TYPE");
            }
        }
    }
    handleConfigError(err, errInfo) {
        const POSSIBLE_ERRORS = {
            "ROUTES_PARAM:INVALID_VALIDATE_TYPE": {
                title: "Invalid 'validate' property type",
                details: "The 'validate' property must be an object, but received: " +
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
                details: "The RoutesParam instance requires a 'middleware' function to be defined",
                fix: "Provide a middleware function as the second parameter:\n    new RoutesParam('userId', (req, res, next, id) => { /* handler */ })",
            },
            "ROUTES_PARAM:INVALID_PATTERN_TYPE": {
                title: "Invalid 'validate.pattern' property type",
                details: "The 'validate.pattern' property must be a RegExp, but received: " +
                    typeof this.validate?.pattern,
                fix: "Ensure pattern is a RegExp:\n    validate: { pattern: /^[0-9]+$/ }",
            },
            "ROUTES_PARAM:INVALID_MIN_LENGTH_TYPE": {
                title: "Invalid 'validate.minLength' property type",
                details: "The 'validate.minLength' property must be a number, but received: " +
                    typeof this.validate?.minLength,
                fix: "Ensure minLength is a number:\n    validate: { minLength: 3 }",
            },
            "ROUTES_PARAM:INVALID_MAX_LENGTH_TYPE": {
                title: "Invalid 'validate.maxLength' property type",
                details: "The 'validate.maxLength' property must be a number, but received: " +
                    typeof this.validate?.maxLength,
                fix: "Ensure maxLength is a number:\n    validate: { maxLength: 50 }",
            },
            "ROUTES_PARAM:INVALID_VALIDATOR_FN_TYPE": {
                title: "Invalid 'validate.validatorFn' property type",
                details: "The 'validate.validatorFn' property must be a function, but received: " +
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
    validateValue(value) {
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
        if (this.validate.minLength !== undefined &&
            value.length < this.validate.minLength) {
            return false;
        }
        /**
         * Check maxLength
         */
        if (this.validate.maxLength !== undefined &&
            value.length > this.validate.maxLength) {
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
exports.default = RoutesParam;
