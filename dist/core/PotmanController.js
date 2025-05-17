"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Postman_1 = __importDefault(require("../generators/Postman"));
const Routes_1 = __importDefault(require("./Routes"));
class PostmanController {
    constructor(routes, postman) {
        this.routes = routes ? routes : new Routes_1.default({ prefix: "", routes: [] });
        this.postman = postman;
    }
    generatePostmanCollection(filePath) {
        if (this.postman) {
            const postmanGen = new Postman_1.default(this.postman.name, this.postman.description, {
                version: this.postman.version,
                baseUrl: this.postman.baseUrl,
            });
            postmanGen.generateCollection(new Routes_1.default({
                prefix: "",
                routes: [this.routes],
            }).generateFolder());
            postmanGen.saveCollectionToFile(filePath);
        }
        else {
            throw new Error("Postman config is not defined");
        }
    }
    generatePostmanEnvironment(filePath) {
        if (this.postman) {
            const postmanGen = new Postman_1.default(this.postman.name, this.postman.description, {
                version: this.postman.version,
                baseUrl: this.postman.baseUrl,
            });
            postmanGen.generateEnvironment(new Routes_1.default({
                prefix: "",
                routes: [this.routes],
            }).generateFolder());
            postmanGen.saveEnvironmentToFile(filePath);
        }
        else {
            throw new Error("Postman config is not defined");
        }
    }
}
exports.default = PostmanController;
