import { ModuleConfig } from "../types";
import Route from "./Route";
import Routes from "./Routes";

class Module<T> {
  public name: string;
  public routes: Routes;
  public config: T;
  public bootstrap?: () => Promise<void> | void;
  constructor(config: ModuleConfig<T>) {
    if (!config.routes) {
      throw new Error("Module name and version are required");
    }
    this.name = config.name;
    this.routes = config.routes;
    this.config = config.config;
    this.bootstrap = config.bootstrap;

    /**
     * All the required fields must be given
     * throw an error if not
     */
    if (!this.name) {
      throw new Error("Module name is required");
    }
    if (!this.routes) {
      throw new Error("Module routes are required");
    }
    if (!this.config) {
      throw new Error("Module config is required");
    }
    if (!(this.routes instanceof Routes)) {
      throw new Error("Module routes must be an instance of Routes");
    }
    if (
      this.bootstrap &&
      (typeof this.bootstrap !== "function" ||
        this.bootstrap instanceof Promise)
    ) {
      throw new Error("Module bootstrap must be a function");
    }
    // Register the module to all routes
    this.addModuleToAllRoutes();
  }

  private addModuleToAllRoutes(): void {
    this.routes.registerModule(this);
  }
}
export default Module;
