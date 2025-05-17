import { IRAI, IRole } from "../lib/rais/types/index.ts";

declare global {
  namespace Express {
    interface Locals {
      roles?: IRole[];
      rais?: IRAI[];
    }


    // Extend the Request interface
    interface Request {
      rai?: IRAI;
      rais?: IRAI[];
      user?: {
        roles: string[];
      };
    }

    interface Response { }
  }
}
