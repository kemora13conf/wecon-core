declare class RequestError extends Error {
    meta: Record<string, any>;
    constructor(message: string, meta?: Record<string, any>);
}
export default RequestError;
