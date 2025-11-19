/**
 * PostmanForRoute class
 * Configures how a single Route should be represented as a request item in Postman
 */
class PostmanForRoute {
    constructor(config) {
        this.name = config.name;
        this.description = config.description;
        this.auth = config.auth;
        this.variable = config.variable;
        this.event = config.event;
        this.protocolProfileBehavior = config.protocolProfileBehavior;
        this.headers = config.headers;
        this.query = config.query;
        this.body = config.body;
        this.response = config.response;
    }
    /**
     * Converts this PostmanForRoute configuration into a Postman collection item
     * @param route The Route instance to generate the Postman item for
     * @param baseUrl Optional base URL for the collection (e.g., "{{baseUrl}}" or "http://localhost:3000")
     * @returns Postman collection item object
     */
    toPostmanItem(route, baseUrl = "{{baseUrl}}") {
        // Convert Express-style path (/users/:id) to Postman-style path (/users/{{id}})
        const postmanPath = this.convertPathToPostman(route.path);
        // Build URL object
        const url = {
            raw: `${baseUrl}${postmanPath}`,
            host: baseUrl.includes("://") ? [baseUrl] : [baseUrl],
            path: postmanPath.split("/").filter(segment => segment !== ""),
        };
        // Add query parameters if configured
        if (this.query) {
            url.query = Object.entries(this.query).map(([key, value]) => ({
                key,
                value,
                disabled: false,
            }));
        }
        // Build headers array
        const headers = [];
        if (this.headers) {
            Object.entries(this.headers).forEach(([key, value]) => {
                headers.push({ key, value, disabled: false });
            });
        }
        // Build request object
        const request = {
            method: route.method.toUpperCase(),
            header: headers,
            url,
        };
        // Add body if configured
        if (this.body) {
            request.body = {
                mode: this.body.mode,
                ...(this.body.mode === "raw" && this.body.raw !== undefined
                    ? { raw: this.body.raw }
                    : {}),
                ...(this.body.mode === "urlencoded" && this.body.urlencoded
                    ? { urlencoded: this.body.urlencoded }
                    : {}),
                ...(this.body.mode === "formdata" && this.body.formdata
                    ? { formdata: this.body.formdata }
                    : {}),
                ...(this.body.mode === "file" && this.body.file
                    ? { file: this.body.file }
                    : {}),
                ...(this.body.mode === "graphql" && this.body.graphql
                    ? { graphql: this.body.graphql }
                    : {}),
                ...(this.body.options ? { options: this.body.options } : {}),
            };
        }
        // Add auth if configured
        if (this.auth !== undefined) {
            request.auth = this.auth;
        }
        // Build the item
        const item = {
            name: this.name || route.name,
            request,
        };
        // Add optional properties
        if (this.description !== undefined) {
            item.description = this.description;
        }
        else if (route.description) {
            item.description = route.description;
        }
        if (this.variable) {
            item.variable = this.variable;
        }
        if (this.event) {
            item.event = this.event;
        }
        if (this.protocolProfileBehavior) {
            item.protocolProfileBehavior = this.protocolProfileBehavior;
        }
        if (this.response) {
            item.response = this.response;
        }
        return item;
    }
    /**
     * Converts Express-style path parameters to Postman-style variables
     * Example: /users/:id/:postId -> /users/{{id}}/{{postId}}
     * @param path Express-style path
     * @returns Postman-style path
     */
    convertPathToPostman(path) {
        return path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, "{{$1}}");
    }
}
export default PostmanForRoute;
