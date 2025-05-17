interface PostmanEnvironment {
    id: string;
    name: string;
    values: PostmanVariable[];
    _postman_variable_scope: string;
}
interface PostmanCollection {
    info: PostmanInfo;
    item: PostmanRouteItem[];
    variable: PostmanVariable[];
}
interface PostmanInfo {
    name: string;
    description?: string;
    schema: string;
}
interface PostmanRouteItem {
    name: string;
    item?: PostmanRouteItem[];
    request?: PostmanRequest;
}
interface PostmanUrl {
    raw: string;
    host: string[];
    path: string[];
    query?: Array<{
        key: string;
        value: string;
        description?: string;
    }>;
}
interface IMixed {
    mode?: 'raw' | 'urlencoded' | 'formdata' | 'file' | 'graphql';
    raw?: string;
    urlencoded?: Array<{
        key: string;
        value: string;
        description?: string;
    }>;
    formdata?: Array<{
        key: string;
        value: string;
        type?: string;
        description?: string;
    }>;
    options?: {
        raw?: {
            language?: string;
        };
    };
}
interface PostmanRequest {
    method: string;
    header?: Array<{
        key: string;
        value: string;
        description?: string;
    }>;
    url: string | PostmanUrl;
    body?: IMixed;
    description?: string;
    auth?: Record<string, unknown>;
}
interface PostmanVariable {
    key: string;
    value: string;
    type: string;
    description?: string;
}
interface SaveOptions {
    encoding: BufferEncoding;
    flag: string;
}
export type { PostmanCollection, PostmanEnvironment, PostmanInfo, PostmanRouteItem, PostmanUrl, PostmanRequest, PostmanVariable, SaveOptions };
