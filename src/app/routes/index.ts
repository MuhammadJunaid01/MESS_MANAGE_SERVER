import { Router } from "express";
import { IRoute } from "../interfaces/global.interface";
import { userRouter } from "../modules/User/user.route";

const router = Router();

const modules: IRoute[] = [{ path: "/auth", route: userRouter }];
modules.forEach(({ path, route }) => router.use(path, route));

export default router;
