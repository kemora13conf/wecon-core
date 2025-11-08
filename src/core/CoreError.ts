/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CoreError class for handling core-related errors.
 * @module CoreError
 * @author Abdelghani El Mouak
 * @license MIT
 *
 * @description
 * A custom error class that extends the built-in Error class to include
 * additional properties such as error code and extra information.
 *
 * So the user can catch this error and handle it accordingly the code and extra info
 * are useful especially if the user wants to internationalize the error messages.
 *
 * @example
 * ```typescript
 * try {
 *   // Some code that may throw a CoreError
 * } catch (error) {
 *   if (error instanceof CoreError) {
 *     console.error(`Error Code: ${error.code}`);
 *     if (error.extra) {
 *       console.error(`Extra Info: ${JSON.stringify(error.extra)}`);
 *     }
 *   } else {
 *     console.error(error);
 *   }
 * }
 * ```
 * @class CoreError
 * @extends Error
 * @property {string} code - A string representing the error code.
 * @property {Record<string, any>} [extra] - An optional object containing additional error information.
 *
 * @throws {CoreError} Throws a CoreError with a specific code and optional extra information.
 * @example
 * throw new CoreError('ROLE_NOT_AUTHORIZED_TO_ACCESS_RAI', { role: 'guest', rai: 'admin.users.list', route: '/admin/users' }, 'The guest role is not authorized to access the admin.users.list RAI.');
 */
class CoreError extends Error {
  readonly code: string;
  readonly extra?: Record<string, any>;
  constructor(code: string, extra?: Record<string, any>, message?: string) {
    super(message || `${CoreError.name} [${code}]`);
    this.name = "CoreError";
    this.code = code;
    if (extra) {
      this.extra = extra;
    }

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default CoreError;
