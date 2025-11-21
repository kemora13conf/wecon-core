/**
 * OpenAPI 3.0.0 Types
 * Based on https://spec.openapis.org/oas/v3.0.0
 */

export interface OpenApiConfig {
  openapi: "3.0.0";
  info: OpenApiInfo;
  servers?: OpenApiServer[];
  paths?: Record<string, OpenApiPathItem>;
  components?: OpenApiComponents;
  security?: OpenApiSecurityRequirement[];
  tags?: OpenApiTag[];
  externalDocs?: OpenApiExternalDocumentation;
}

export interface OpenApiInfo {
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: OpenApiContact;
  license?: OpenApiLicense;
  version: string;
}

export interface OpenApiContact {
  name?: string;
  url?: string;
  email?: string;
}

export interface OpenApiLicense {
  name: string;
  url?: string;
}

export interface OpenApiServer {
  url: string;
  description?: string;
  variables?: Record<string, OpenApiServerVariable>;
}

export interface OpenApiServerVariable {
  enum?: string[];
  default: string;
  description?: string;
}

export interface OpenApiComponents {
  schemas?: Record<string, OpenApiSchema | OpenApiReference>;
  responses?: Record<string, OpenApiResponse | OpenApiReference>;
  parameters?: Record<string, OpenApiParameter | OpenApiReference>;
  examples?: Record<string, OpenApiExample | OpenApiReference>;
  requestBodies?: Record<string, OpenApiRequestBody | OpenApiReference>;
  headers?: Record<string, OpenApiHeader | OpenApiReference>;
  securitySchemes?: Record<string, OpenApiSecurityScheme | OpenApiReference>;
  links?: Record<string, OpenApiLink | OpenApiReference>;
  callbacks?: Record<string, OpenApiCallback | OpenApiReference>;
}

export interface OpenApiPathItem {
  $ref?: string;
  summary?: string;
  description?: string;
  get?: OpenApiOperation;
  put?: OpenApiOperation;
  post?: OpenApiOperation;
  delete?: OpenApiOperation;
  options?: OpenApiOperation;
  head?: OpenApiOperation;
  patch?: OpenApiOperation;
  trace?: OpenApiOperation;
  servers?: OpenApiServer[];
  parameters?: (OpenApiParameter | OpenApiReference)[];
}

export interface OpenApiOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: OpenApiExternalDocumentation;
  operationId?: string;
  parameters?: (OpenApiParameter | OpenApiReference)[];
  requestBody?: OpenApiRequestBody | OpenApiReference;
  responses: OpenApiResponses;
  callbacks?: Record<string, OpenApiCallback | OpenApiReference>;
  deprecated?: boolean;
  security?: OpenApiSecurityRequirement[];
  servers?: OpenApiServer[];
}

export interface OpenApiParameter {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: OpenApiSchema | OpenApiReference;
  example?: any;
  examples?: Record<string, OpenApiExample | OpenApiReference>;
}

export interface OpenApiRequestBody {
  description?: string;
  content: Record<string, OpenApiMediaType>;
  required?: boolean;
}

export interface OpenApiMediaType {
  schema?: OpenApiSchema | OpenApiReference;
  example?: any;
  examples?: Record<string, OpenApiExample | OpenApiReference>;
  encoding?: Record<string, OpenApiEncoding>;
}

export interface OpenApiResponses {
  default?: OpenApiResponse | OpenApiReference;
  [statusCode: string]: OpenApiResponse | OpenApiReference | undefined;
}

export interface OpenApiResponse {
  description: string;
  headers?: Record<string, OpenApiHeader | OpenApiReference>;
  content?: Record<string, OpenApiMediaType>;
  links?: Record<string, OpenApiLink | OpenApiReference>;
}

export interface OpenApiHeader {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: OpenApiSchema | OpenApiReference;
  example?: any;
  examples?: Record<string, OpenApiExample | OpenApiReference>;
}

export interface OpenApiTag {
  name: string;
  description?: string;
  externalDocs?: OpenApiExternalDocumentation;
}

export interface OpenApiReference {
  $ref: string;
}

export interface OpenApiSchema {
  title?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  enum?: any[];
  type?: "string" | "number" | "integer" | "boolean" | "array" | "object";
  allOf?: (OpenApiSchema | OpenApiReference)[];
  oneOf?: (OpenApiSchema | OpenApiReference)[];
  anyOf?: (OpenApiSchema | OpenApiReference)[];
  not?: OpenApiSchema | OpenApiReference;
  items?: OpenApiSchema | OpenApiReference;
  properties?: Record<string, OpenApiSchema | OpenApiReference>;
  additionalProperties?: boolean | OpenApiSchema | OpenApiReference;
  description?: string;
  format?: string;
  default?: any;
  nullable?: boolean;
  discriminator?: OpenApiDiscriminator;
  readOnly?: boolean;
  writeOnly?: boolean;
  xml?: OpenApiXml;
  externalDocs?: OpenApiExternalDocumentation;
  example?: any;
  deprecated?: boolean;
}

export interface OpenApiDiscriminator {
  propertyName: string;
  mapping?: Record<string, string>;
}

export interface OpenApiXml {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}

export interface OpenApiSecurityScheme {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect";
  description?: string;
  name?: string;
  in?: "query" | "header" | "cookie";
  scheme?: string;
  bearerFormat?: string;
  flows?: OpenApiOAuthFlows;
  openIdConnectUrl?: string;
}

export interface OpenApiOAuthFlows {
  implicit?: OpenApiOAuthFlow;
  password?: OpenApiOAuthFlow;
  clientCredentials?: OpenApiOAuthFlow;
  authorizationCode?: OpenApiOAuthFlow;
}

export interface OpenApiOAuthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface OpenApiSecurityRequirement {
  [name: string]: string[];
}

export interface OpenApiExternalDocumentation {
  description?: string;
  url: string;
}

export interface OpenApiExample {
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: string;
}

export interface OpenApiCallback {
  [expression: string]: OpenApiPathItem;
}

export interface OpenApiLink {
  operationRef?: string;
  operationId?: string;
  parameters?: Record<string, any | string>;
  requestBody?: any | string;
  description?: string;
  server?: OpenApiServer;
}

export interface OpenApiEncoding {
  contentType?: string;
  headers?: Record<string, OpenApiHeader | OpenApiReference>;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
}

/**
 * Wecon Specific Configs
 */

export interface WeconOpenApiConfig {
  /** Title of the API */
  title: string;
  /** Description of the API */
  description?: string;
  /** API version */
  version?: string;
  /** Output file path (e.g., ./openapi.json) */
  output?: string;
  /** Additional OpenAPI info */
  info?: Partial<OpenApiInfo>;
  /** Servers configuration */
  servers?: OpenApiServer[];
  /** Security schemes */
  securitySchemes?: Record<string, OpenApiSecurityScheme | OpenApiReference>;
}

export interface OpenApiRouteConfig {
  /** Summary of the operation */
  summary?: string;
  /** Detailed description */
  description?: string;
  /** Tags for grouping */
  tags?: string[];
  /** Operation ID (unique) */
  operationId?: string;
  /** Request body configuration */
  requestBody?: OpenApiRequestBody | OpenApiReference;
  /** Responses configuration */
  responses?: OpenApiResponses;
  /** Parameters configuration */
  parameters?: (OpenApiParameter | OpenApiReference)[];
  /** Security requirements */
  security?: OpenApiSecurityRequirement[];
  /** Deprecated flag */
  deprecated?: boolean;
}

export interface OpenApiGroupConfig {
  /** Tag name to apply to all child routes */
  tag?: string;
  /** Common security requirements */
  security?: OpenApiSecurityRequirement[];
}
