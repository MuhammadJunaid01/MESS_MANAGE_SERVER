"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleMealCreation = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const meal_interface_1 = require("../modules/Meal/meal.interface");
const meal_schema_1 = __importDefault(require("../modules/Meal/meal.schema"));
const mess_schema_1 = __importDefault(require("../modules/Mess/mess.schema"));
const user_schema_1 = __importDefault(require("../modules/User/user.schema"));
const scheduleMealCreation = () => {
    node_cron_1.default.schedule("0 0 1 * *", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Running meal creation cron job for upcoming month");
        try {
            const messes = yield mess_schema_1.default.find({
                isDeleted: false,
                status: "active",
            });
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            nextMonth.setDate(1);
            const year = nextMonth.getFullYear();
            const month = nextMonth.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            for (const mess of messes) {
                const users = yield user_schema_1.default.find({
                    messId: mess._id,
                    isApproved: true,
                    isBlocked: false,
                    isVerified: true,
                });
                const bulkOps = [];
                for (const user of users) {
                    for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day);
                        bulkOps.push({
                            insertOne: {
                                document: {
                                    userId: user._id,
                                    messId: mess._id,
                                    date,
                                    meals: [
                                        { type: meal_interface_1.MealType.Breakfast, isActive: true },
                                        { type: meal_interface_1.MealType.Lunch, isActive: true },
                                        { type: meal_interface_1.MealType.Dinner, isActive: true },
                                    ],
                                },
                            },
                        });
                    }
                }
                if (bulkOps.length > 0) {
                    yield meal_schema_1.default.bulkWrite(bulkOps, { ordered: false });
                    console.log(`Created meals for mess ${mess.messId} for ${users.length} users`);
                }
            }
        }
        catch (err) {
            console.error("Meal creation cron job failed:", err);
        }
    }));
};
exports.scheduleMealCreation = scheduleMealCreation;
