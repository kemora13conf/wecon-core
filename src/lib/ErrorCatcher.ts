import chalk from "chalk";
import { ErrorInfoType, ErrorTraceType } from "../types";

/**
 * Abstract base class that provides common functionality for error tracking and debugging.
 *
 * This class offers utilities to capture caller information from the stack trace,
 * which is useful for debugging and error reporting in derived classes.
 *
 * @abstract
 * @class ErrorCatcher
 */
export abstract class ErrorCatcher {
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
  static getCallerInfo(): ErrorTraceType {
    const err = new Error();
    const stack = err.stack || "";

    // Split into lines and remove the "Error" line
    const stackLines = stack.split("\n").slice(1);

    // Find the caller (skip getCallerInfo and constructor frames)
    // Adjust the index based on your call depth
    const callerLine = stackLines[2] || stackLines[1] || "";

    // Try to match different stack trace formats
    // V8 format: "    at ClassName.method (file:///path/file.ts:15:23)"
    // or: "    at file:///path/file.ts:15:23"
    let match = callerLine.match(/\((.+?):(\d+):(\d+)\)$/);

    if (!match) {
      // Try alternative format without parentheses
      match = callerLine.match(/at\s+(.+?):(\d+):(\d+)$/);
    }

    if (match) {
      const file = match[1].replace("file://", "");
      const line = parseInt(match[2], 10);
      const column = parseInt(match[3], 10);

      // Extract function name
      const functionMatch = callerLine.match(/at\s+(?:async\s+)?(\S+?)\s+\(/);
      const functionName = functionMatch ? functionMatch[1] : null;

      return { file, line, column, function: functionName };
    }

    return {
      file: "unknown",
      line: 0,
      column: 0,
      function: null,
    };
  }

  static logError(error: ErrorInfoType, tracedSatckInfo: ErrorTraceType): void {
    console.error(
      chalk.red.bold(
        "\n╔══════════════════════════════════════════════════════════╗"
      ),
      chalk.red.bold("\n║") +
        chalk.white.bold(
          "  Route Configuration Error                            "
        ) +
        chalk.red.bold("   ║"),
      chalk.red.bold(
        "\n╚══════════════════════════════════════════════════════════╝\n"
      )
    );

    console.error(chalk.red.bold("✖ Error:"), chalk.white(error.title));
    console.error(chalk.gray("\n  Details:"), chalk.white(error.details));
    console.error(
      chalk.gray("\n  Location:"),
      chalk.cyan(
        `${tracedSatckInfo.file}:${tracedSatckInfo.line}:${tracedSatckInfo.column}`
      )
    );
    console.error(chalk.yellow.bold("\n  💡 How to fix:"));
    console.error(chalk.yellow(`  ${error.fix.replace(/\n/g, "\n  ")}`));
    console.error(""); // Empty line for spacing

    // exit the process with failure
    process.exit(1);
  }
}

export default ErrorCatcher;
