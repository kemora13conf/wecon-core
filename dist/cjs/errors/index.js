"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Import all error definitions here and re-export them
 * for easier access throughout the application.
 */
const ConfigError_1 = __importDefault(require("./ConfigError"));
const RequestError_1 = __importDefault(require("./RequestError"));
exports.default = { ConfigError: ConfigError_1.default, RequestError: RequestError_1.default };
