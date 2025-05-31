import { ModuleConfig } from "../types";
import Routes from "./Routes";
declare class Module<T> {
    name: string;
    routes: Routes & {
        module: Module<T>;
    };
    config: T;
    bootstrap?: () => Promise<void> | void;
    i18n?: {
        [key: string]: Record<string, string>;
    };
    constructor(config: ModuleConfig<T>);
    private addModuleToAllRoutes;
}
export default Module;
