import { ModuleConfig } from "../types";
import Routes from "./Routes";
declare class Module<T> {
    name: string;
    routes: Routes;
    config: T;
    bootstrap?: () => Promise<void> | void;
    constructor(config: ModuleConfig<T>);
    private addModuleToAllRoutes;
}
export default Module;
