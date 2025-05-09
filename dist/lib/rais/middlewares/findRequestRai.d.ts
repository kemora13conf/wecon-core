import { NextFunction, Request, Response } from "express";
/**
 * Middleware to find the request RAI (Role Access Interface) based on the request URL and method.
 * It matches the request URL with the defined RAIs in app.locals. If a match is found, it attaches
 * the RAI object to the request object and calls the next middleware. If no match is found, it
 * returns a 404 error.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export declare const findRequestRai: (req: Request, res: Response, next: NextFunction) => Promise<void>;
