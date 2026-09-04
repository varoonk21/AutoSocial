import type { UserRole } from "@edvaris/db";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: any;
      session?: any;
    }
  }
}

export {};
