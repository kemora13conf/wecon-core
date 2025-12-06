import { RAI } from ".";
import Route from "../lib/Route";

interface WeconRequest {
  rai?: RAI;
  route_instance?: Route;
  rais?: RAI[];
  user?: {
    roles: string[];
  };
}

declare global {
  namespace Express {
    interface Locals {}

    // Extend the Request interface
    interface Request extends WeconRequest {}

    interface Response {}
  }
}
