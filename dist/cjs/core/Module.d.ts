import { ModuleConfig } from "../types";
import Routes from "./Routes";
declare class Module<T> {
    name: string;
    routes: Routes & {
        module: Module<T>;
    };
    bootstrap?: () => Promise<void> | void;
    i18n?: ModuleConfig["i18n"];
    /**
     * Module class to encapsulate routes and bootstrap functionality
     * @param config - Configuration object for the module
     */
    constructor(config: ModuleConfig);
    private addModuleToAllRoutes;
}
export default Module;
