import { PostmanConfig } from "../types";
import Routes from "./Routes";
declare class PostmanController {
    postman?: PostmanConfig;
    routes: Routes;
    constructor(routes?: Routes, postman?: PostmanConfig);
    generatePostmanCollection(filePath: string): void;
    generatePostmanEnvironment(filePath: string): void;
}
export default PostmanController;
