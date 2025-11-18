declare class ConfigError extends Error {
    meta: Record<string, any>;
    constructor(message: string, meta?: Record<string, any>);
}
export default ConfigError;
