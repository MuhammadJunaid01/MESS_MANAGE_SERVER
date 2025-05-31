import { Router } from "express";
import { IRoute } from "../interfaces/global.interface";

const router = Router();

const modules: IRoute[] = [];
modules.forEach(({ path, route }) => router.use(path, route));

export default router;
