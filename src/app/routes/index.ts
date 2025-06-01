import { Router } from "express";
import { IRoute } from "../interfaces/global.interface";
import { messRouter } from "../modules/Mess/mess.route";
import { userRouter } from "../modules/User/user.route";

const router = Router();

const modules: IRoute[] = [
  { path: "/auth", route: userRouter },
  { path: "/mess", route: messRouter },
];
modules.forEach(({ path, route }) => router.use(path, route));

export default router;
