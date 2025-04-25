import { Express } from 'express';
import Routes from './Routes';
import { AppWrapperConfig, PostmanConfig, SecurityConfig } from '../types';
import PostmanGenerator from '../generators/Postman';
import { PostmanRouteItem } from '../types/postman';

class AppWrapper {
    private express: Express;
    private routes: Routes;
    private postman?: PostmanConfig;
    private security?: SecurityConfig;

    constructor(config: AppWrapperConfig) {
        this.express = config.express;
        this.routes = config.routes;
        this.postman = config.postman;
        this.security = config.security;
    }
    public getExpress(): Express {
        this.express.use(this.routes.buildRouter());
        return this.express;
    }

    public generatePostmanCollection(filePath: string): void {
        if (this.postman) {
            const postmanGen = new PostmanGenerator(this.postman.name, this.postman.description, {
                version: this.postman.version,
                baseUrl: this.postman.baseUrl,
            });
            postmanGen.generateCollection(new Routes({
                prefix: '',
                routes: [this.routes],
            }).generateFolder() as PostmanRouteItem[]);

            postmanGen.saveCollectionToFile(filePath)
        } else {
            throw new Error('Postman config is not defined');
        }
    }

    public savePostmanEnvironment(filePath: string): void {
        if (this.postman) {
            const postmanGen = new PostmanGenerator(this.postman.name, this.postman.description, {
                version: this.postman.version,
                baseUrl: this.postman.baseUrl,
            });
            postmanGen.generateEnvironment(new Routes({
                prefix: '',
                routes: [this.routes],
            }).generateFolder() as PostmanRouteItem[]);

            postmanGen.saveEnvironmentToFile(filePath)
        } else {
            throw new Error('Postman config is not defined');
        }
    }
}


export default AppWrapper;