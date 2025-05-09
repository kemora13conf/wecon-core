import Route from "../../../core/Route";
import Routes from "../../../core/Routes";
import { IRAI } from "../types";
declare function extractRoutesAndroles(routes: Routes[] | Route[], prefix?: string, depth?: number): {
    routes: IRAI[];
    roles: string[];
};
export { extractRoutesAndroles };
