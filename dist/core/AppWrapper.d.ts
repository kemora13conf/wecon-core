import { Express } from "express";
import { AppWrapperConfig } from "../types";
import PostmanController from "./PotmanController";
declare class AppWrapper extends PostmanController {
    private app;
    private roles?;
    constructor(config: AppWrapperConfig);
    getExpressApp(): Express;
}
export default AppWrapper;
