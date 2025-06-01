import * as dateFns from "date-fns";
import { AuthUser } from "./src/app/interfaces/global.interface";

export {};

// Extend the global Express namespace
declare global {
  namespace Express {
    export interface Request {
      user?: AuthUser; // Add user property to Request
    }

    export interface Application {
      locals: {
        dateFns: typeof dateFns; // Add dateFns property to app.locals
      };
    }
  }
}
