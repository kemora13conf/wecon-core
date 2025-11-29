import { RAI } from ".";
import Route from "../lib/Route";

declare global {
  namespace Express {
    interface Locals {
    }


    // Extend the Request interface
    interface Request {
      rai?: RAI;
      rais?: RAI[];
      route?: Route;
      user?: {
        roles: string[];
      };
    }

    interface Response { }
  }
}
