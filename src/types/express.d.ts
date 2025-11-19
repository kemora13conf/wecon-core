import { RAI } from ".";

declare global {
  namespace Express {
    interface Locals {
    }


    // Extend the Request interface
    interface Request {
      rai?: RAI;
      rais?: RAI[];
      user?: {
        roles: string[];
      };
    }

    interface Response { }
  }
}
