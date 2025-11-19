declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}
declare const app: import("express-serve-static-core").Express;
export default app;
export { app };
