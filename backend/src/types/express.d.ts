// types/express.d.ts
import { Request } from "express";
import { User } from "@prisma/client";

declare global {
    namespace Express {
        interface UserPayload {
            id: string;
            email: string;
            role: string;
        }

        export interface Request {
            user?: UserPayload;
        }
    }
}

export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string };
}
