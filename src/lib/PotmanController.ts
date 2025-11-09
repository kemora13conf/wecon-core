import PostmanGenerator from "../generators/Postman";
import { PostmanConfig } from "../types";
import { PostmanRouteItem } from "../types/postman";
import Routes from "./Routes";

class PostmanController {
  public postman?: PostmanConfig;
  public routes: Routes;
  constructor(routes?: Routes, postman?: PostmanConfig) {
    this.routes = routes ? routes : new Routes({ prefix: "", routes: [] });
    this.postman = postman;
  }
  public generatePostmanCollection(filePath: string): void {
    if (this.postman) {
      const postmanGen = new PostmanGenerator(
        this.postman.name,
        this.postman.description,
        {
          version: this.postman.version,
          baseUrl: this.postman.baseUrl,
        }
      );
      postmanGen.generateCollection(
        new Routes({
          prefix: "",
          routes: [this.routes],
        }).generateFolder() as PostmanRouteItem[]
      );

      postmanGen.saveCollectionToFile(filePath);
    } else {
      throw new Error("Postman config is not defined");
    }
  }

  public generatePostmanEnvironment(filePath: string): void {
    if (this.postman) {
      const postmanGen = new PostmanGenerator(
        this.postman.name,
        this.postman.description,
        {
          version: this.postman.version,
          baseUrl: this.postman.baseUrl,
        }
      );
      postmanGen.generateEnvironment(
        new Routes({
          prefix: "",
          routes: [this.routes],
        }).generateFolder() as PostmanRouteItem[]
      );

      postmanGen.saveEnvironmentToFile(filePath);
    } else {
      throw new Error("Postman config is not defined");
    }
  }
}

export default PostmanController;