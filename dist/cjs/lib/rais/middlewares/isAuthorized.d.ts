import { NextFunction, Request, Response } from "express";
export declare const isAuthorized: (req: Request, res: Response, next: NextFunction) => Promise<void>;
