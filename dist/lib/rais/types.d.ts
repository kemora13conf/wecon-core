interface IRole {
    _id: string;
    name: string;
}
interface IRAI {
    method: string;
    path: string;
    _id: string;
    name: string;
    description: string;
    rai: string;
    children: string[];
    roles: string[];
    isStopped: boolean;
    module: string;
}
export type { IRAI, IRole };
