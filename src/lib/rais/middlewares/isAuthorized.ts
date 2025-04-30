import { NextFunction, Request, Response } from "express";
import { ApiRouteNotFoundError } from "../../../errors";
import { IRole } from "../types";

export const isAuthorized = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the current user roles
    const u_roles: string[] = [];
    if (req.user && Array.isArray(req.user.roles)) {
      u_roles.push(...req.user.roles);
    } else {
      u_roles.push("guest");
    }

    // Access the values of roles from app.locals
    const roles = (req.app.locals.roles || []).filter((role: IRole) =>
      u_roles.includes(role.name)
    ) as IRole[];

    /**
     * This middleware should be executed after the findRequestRai middleware
     * so the rai object should be available in the request object
     */
    const rai = req.rai;
    if (!rai) {
      return next(new ApiRouteNotFoundError("RAI not found"));
    }

    // Check if the user has the access to the rai by his roles
    const isAuthorized = rai.roles.some((role: string) =>
      roles.some((r: IRole) => r._id === role)
    );
    
    if (!isAuthorized) {
      return next(new ApiRouteNotFoundError("Unauthorized access"));
    }

    return next();
  } catch (error) {
    return next(error);
  }
  return next();
};
