import { NextFunction, Request, Response } from "express";
import { match } from "path-to-regexp";
import { IRAI } from "../types";
import { NotFoundRouteError } from "../../../errors";

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
export const findRequestRai = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Access the values of roles and rais from app.locals
    const rais = req.app.locals.rais as IRAI[];

    const route = req.originalUrl.split("?")[0];
    const method = req.method;

    const rai = rais.find((r) => {
      // Add a check to ensure r.path is a string
      if (typeof r.path === "string") {
        const test = match(r.path);
        return test(route) && r.method?.trim() === method?.trim();
      }
      return false;
    });

    if (rai) {
      req.rai = rai;
      return next();
    } else {
      return next(new NotFoundRouteError("RAI not found"));
    }
  } catch (error) {
    return next(error);
  }
};
