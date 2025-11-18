/* eslint-disable @typescript-eslint/no-explicit-any */

class RequestError extends Error {
  public meta: Record<string, any>;

  constructor(message: string, meta: Record<string, any> = {}) {
    super(`RequestError: ${message}`);
    this.message = message;
    this.meta = meta;

    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, RequestError.prototype);
    this.name = "RequestError";

    /**
     * Capture the stack trace for better debugging.
     * This ensures that the stack trace starts from where the error was thrown,
     * excluding the constructor call.
     */
    if ("captureStackTrace" in Error) {
      Error.captureStackTrace(this, RequestError);
    }
  }
}

export default RequestError;
