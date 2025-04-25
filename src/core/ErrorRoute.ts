import { PathParams } from "express-serve-static-core";

interface IErrorRoute {
    middleware: PathParams;
}

class ErrorRoute {
    middleware: PathParams;

    constructor(r: IErrorRoute) {
        this.middleware = r.middleware;
    }
}

export default ErrorRoute;
export type { IErrorRoute };