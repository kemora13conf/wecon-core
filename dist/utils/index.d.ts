import { RAI } from "../types";
type PTRMConfig = {
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    rais: Array<{
        rai: RAI;
        path: string;
        method: "GET" | "POST" | "PUT" | "DELETE";
    }>;
};
/**
 * Path to RAI matcher utility
 * @function pathToRaiMatcher
 * @param { PTRMConfig } config - Configuration object containing path and method
 * @returns { RAI | null } - Returns the matched RAI or null if no match is found
 */
export declare function pathToRaiMatcher(config: PTRMConfig): RAI | null;
export {};
