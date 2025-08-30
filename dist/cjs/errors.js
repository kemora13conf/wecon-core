"use strict";
/**
 * Custom errors
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIOError = exports.SocketAuthError = exports.NotFoundRouteError = exports.InvalidRouteError = exports.ApiRouteNotFoundError = void 0;
class ApiRouteNotFoundError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, ApiRouteNotFoundError.prototype);
    }
}
exports.ApiRouteNotFoundError = ApiRouteNotFoundError;
class InvalidRouteError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, InvalidRouteError.prototype);
    }
}
exports.InvalidRouteError = InvalidRouteError;
class NotFoundRouteError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, NotFoundRouteError.prototype);
    }
}
exports.NotFoundRouteError = NotFoundRouteError;
class SocketAuthError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, SocketAuthError.prototype);
    }
}
exports.SocketAuthError = SocketAuthError;
class SocketIOError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        Object.setPrototypeOf(this, SocketIOError.prototype);
    }
}
exports.SocketIOError = SocketIOError;
