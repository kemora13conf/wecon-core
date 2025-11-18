import { ErrorInfoType, ErrorTraceType } from "./../types";
/**
 * Abstract base class that provides common functionality for error tracking and debugging.
 *
 * This class offers utilities to capture caller information from the stack trace,
 * which is useful for debugging and error reporting in derived classes.
 *
 * @abstract
 * @class BaseClass
 */
export declare abstract class BaseClass {
    /**
     * Retrieves information about the caller that instantiated the current class.
     *
     * This method uses Node.js stack trace manipulation to extract the file, line,
     * column, and function name where the class was instantiated. It skips the
     * immediate call stack to find the actual instantiation location.
     *
     * @protected
     * @returns {Object} An object containing caller information
     * @returns {string} returns.file - The file path where instantiation occurred
     * @returns {number} returns.line - The line number of instantiation
     * @returns {number} returns.column - The column number of instantiation
     * @returns {string | null} returns.function - The function name where instantiation occurred, or null if unknown
     */
    protected getCallerInfo(): ErrorTraceType;
    logError(error: ErrorInfoType, tracedSatckInfo: ErrorTraceType): void;
}
export default BaseClass;
