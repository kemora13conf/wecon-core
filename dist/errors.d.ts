/**
 * Custom errors
 */
export declare class ApiRouteNotFoundError extends Error {
    constructor(message: string);
}
export declare class InvalidRouteError extends Error {
    constructor(message: string);
}
export declare class NotFoundRouteError extends Error {
    constructor(message: string);
}
export declare class SocketAuthError extends Error {
    constructor(message: string);
}
export declare class SocketIOError extends Error {
    message: string;
    constructor(message: string);
}
