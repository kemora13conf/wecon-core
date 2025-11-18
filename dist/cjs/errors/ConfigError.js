"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
class ConfigError extends Error {
    constructor(message, meta = {}) {
        super(`ConfigError: ${message}`);
        this.message = message;
        this.meta = meta;
        // Set the prototype explicitly to maintain instanceof checks
        Object.setPrototypeOf(this, ConfigError.prototype);
        this.name = "ConfigError";
        /**
         * Capture the stack trace for better debugging.
         * This ensures that the stack trace starts from where the error was thrown,
         * excluding the constructor call.
         */
        if ("captureStackTrace" in Error) {
            Error.captureStackTrace(this, ConfigError);
        }
    }
}
exports.default = ConfigError;
