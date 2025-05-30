import { AuthUser } from "./src/app/interfaces/index";
export {}; // Ensure this file is treated as a module

declare global {
  namespace Express {
    export interface Request {
      user?: AuthUser; // or the appropriate type of your `user` object
    }
  }
}
