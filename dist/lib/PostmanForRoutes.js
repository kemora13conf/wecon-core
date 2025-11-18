/**
 * Configuration class for Postman folder (item-group) generation
 * Represents a folder in the Postman collection hierarchy
 *
 * This class is used with the Routes class to configure how the route group
 * appears in the generated Postman collection, including authentication,
 * variables, scripts, and other folder-level properties.
 *
 * @example
 * ```typescript
 * const routes = new Routes({
 *   prefix: '/api/users',
 *   routes: [...],
 *   postman: new PostmanForRoutes({
 *     folderName: 'User Management',
 *     description: 'All user-related endpoints',
 *     auth: {
 *       type: 'bearer',
 *       bearer: [{ key: 'token', value: '{{authToken}}' }]
 *     },
 *     variable: [
 *       { key: 'userId', value: '123', type: 'string' }
 *     ],
 *     event: [
 *       {
 *         listen: 'prerequest',
 *         script: {
 *           exec: ['console.log("Pre-request script");']
 *         }
 *       }
 *     ]
 *   })
 * });
 * ```
 */
class PostmanForRoutes {
    constructor(config) {
        this.folderName = config.folderName;
        this.description = config.description;
        this.auth = config.auth;
        this.variable = config.variable;
        this.event = config.event;
        this.protocolProfileBehavior = config.protocolProfileBehavior;
    }
}
export default PostmanForRoutes;
