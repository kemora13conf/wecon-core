import { RequestParamHandler } from "express";
import BaseClass from "./BaseClass";
declare class RoutesParam extends BaseClass {
    readonly uuidv4: string;
    path: string;
    middleware: RequestParamHandler;
    validate?: {
        pattern?: RegExp;
        minLength?: number;
        maxLength?: number;
        validatorFn?: (value: string) => boolean;
    };
    constructor(path: string, middleware: RequestParamHandler, validate?: {
        pattern?: RegExp;
        minLength?: number;
        maxLength?: number;
        validatorFn?: (value: string) => boolean;
    });
    private validateParam;
    private handleConfigError;
    validateValue(value: string): boolean;
}
export default RoutesParam;
