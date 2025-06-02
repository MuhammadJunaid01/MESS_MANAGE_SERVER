import { Router } from "express";
import { IRoute } from "../interfaces/global.interface";
import { expenseRouter } from "../modules/Expense/expense.route";
import { mealRouter } from "../modules/Meal/meal.route";
import { messRouter } from "../modules/Mess/mess.route";
import { mSettingRouter } from "../modules/MSetting/MSetting.route";
import { reportRouter } from "../modules/Report/report.route";
import { userRouter } from "../modules/User/user.route";

const router = Router();

const modules: IRoute[] = [
  { path: "/auth", route: userRouter },
  { path: "/mess", route: messRouter },
  { path: "/meal", route: mealRouter },
  { path: "/expense", route: expenseRouter },
  { path: "/report", route: reportRouter },
  { path: "/settings", route: mSettingRouter },
];
modules.forEach(({ path, route }) => router.use(path, route));

export default router;
