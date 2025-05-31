import { Express, RequestHandler } from "express";
import { AppWrapperConfig } from "../types";
import PostmanController from "./PotmanController";
declare class AppWrapper extends PostmanController {
    private app;
    private roles?;
    constructor(config: AppWrapperConfig);
    getExpressApp(middlewares?: RequestHandler[]): Express;
}
export default AppWrapper;
