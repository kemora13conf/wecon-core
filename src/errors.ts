/**
 * Custom errors
 */

export class ApiRouteNotFoundError extends Error {

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, ApiRouteNotFoundError.prototype);
    }
}

export class InvalidRouteError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, InvalidRouteError.prototype);
    }
}

export class NotFoundRouteError extends Error {

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, NotFoundRouteError.prototype);
    }
}

export class SocketAuthError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, SocketAuthError.prototype);
    }
}

export class SocketIOError extends Error {
    constructor(public message: string) {
        super(message);
        Object.setPrototypeOf(this, SocketIOError.prototype);
    }
}