"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const meal_route_1 = require("../modules/Meal/meal.route");
const mess_route_1 = require("../modules/Mess/mess.route");
const user_route_1 = require("../modules/User/user.route");
const router = (0, express_1.Router)();
const modules = [
    { path: "/auth", route: user_route_1.userRouter },
    { path: "/mess", route: mess_route_1.messRouter },
    { path: "/meal", route: meal_route_1.mealRouter },
];
modules.forEach(({ path, route }) => router.use(path, route));
exports.default = router;
