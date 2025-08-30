import { PathParams } from "express-serve-static-core";
interface IErrorRoute {
    middleware: PathParams;
}
declare class ErrorRoute {
    middleware: PathParams;
    constructor(r: IErrorRoute);
}
export default ErrorRoute;
export type { IErrorRoute };
