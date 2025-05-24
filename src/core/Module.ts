import { ModuleConfig } from "../types";
import Routes from "./Routes";

class Module<T> {
  public routes: Routes;
  public config: T;
  constructor({ routes, config = {} as T }: ModuleConfig<T>) {
    if (!routes) {
      throw new Error("Module name and version are required");
    }
    this.routes = routes;
    this.config = config;
  }
}
export default Module;
