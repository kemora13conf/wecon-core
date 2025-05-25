import { ModuleConfig } from "../types";
import Routes from "./Routes";

class Module<T> {
  public routes: Routes;
  public config: T;
  public bootstrap?: () => Promise<void> | void;
  constructor(config: ModuleConfig<T>) {
    if (!config.routes) {
      throw new Error("Module name and version are required");
    }
    this.routes = config.routes;
    this.config = config.config;
    this.bootstrap = config.bootstrap;
  }
}
export default Module;
