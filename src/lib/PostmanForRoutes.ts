import type {
  PostmanDescription,
  PostmanAuth,
  PostmanVariableList,
  PostmanEventList,
  PostmanProtocolProfileBehavior,
  PostmanForRoutesConfig,
} from "../types/postman.types";

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
  /** Folder name - the display name for this folder in Postman */
  folderName: string;

  /** Description of the folder/route group */
  description?: PostmanDescription;

  /** Authentication configuration (inherited by child items unless overridden) */
  auth?: PostmanAuth | null;

  /** Variables scoped to this folder */
  variable?: PostmanVariableList;

  /** Pre-request and test scripts for this folder */
  event?: PostmanEventList;

  /** Protocol profile behavior configuration */
  protocolProfileBehavior?: PostmanProtocolProfileBehavior;

  constructor(config: PostmanForRoutesConfig) {
    this.folderName = config.folderName;
    this.description = config.description;
    this.auth = config.auth;
    this.variable = config.variable;
    this.event = config.event;
    this.protocolProfileBehavior = config.protocolProfileBehavior;
  }
}

export default PostmanForRoutes;
