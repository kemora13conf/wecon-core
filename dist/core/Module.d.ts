import { ModuleConfig } from "../types";
import Routes from "./Routes";
declare class Module<T> {
    routes: Routes;
    config: T;
    constructor({ routes, config }: ModuleConfig<T>);
}
export default Module;
