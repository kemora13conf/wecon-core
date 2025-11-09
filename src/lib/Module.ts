import { ModuleConfig } from "../types";
import Routes from "./Routes";

class Module<T> {
  public name: string;
  public routes: Routes & { module: Module<T> }; // Routes with guaranteed module
  public bootstrap?: () => Promise<void> | void;
  i18n?: ModuleConfig["i18n"];

  /**
   * Module class to encapsulate routes and bootstrap functionality
   * @param config - Configuration object for the module
   */
  constructor(config: ModuleConfig) {
    if (!config.routes) {
      throw new Error("Module name and version are required");
    }
    /**
     * All the required fields must be given
     * throw an error if not
     */
    if (!config.name) {
      throw new Error("Module name is required");
    }
    if (!config.routes) {
      throw new Error("Module routes are required");
    }
    if (!(config.routes instanceof Routes)) {
      throw new Error("Module routes must be an instance of Routes");
    }
    if (
      config.bootstrap &&
      (typeof config.bootstrap !== "function" ||
        config.bootstrap instanceof Promise)
    ) {
      throw new Error("Module bootstrap must be a function");
    }
    this.name = config.name;
    this.bootstrap = config.bootstrap;
    this.i18n = config.i18n ? config.i18n : {};
    // Ensure routes have a module reference
    this.addModuleToAllRoutes(config.routes);
    this.routes = config.routes as Routes & { module: Module<T> };
  }

  private addModuleToAllRoutes(routes: Routes) {
    routes.registerModule(this);
  }
}
export default Module;
