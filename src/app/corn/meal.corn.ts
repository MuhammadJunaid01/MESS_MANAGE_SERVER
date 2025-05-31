import cron from "node-cron";
import { MealType } from "../modules/Meal/meal.interface";
import MealModel from "../modules/Meal/meal.schema";
import MessModel from "../modules/Mess/mess.schema";
import UserModel from "../modules/User/user.model";

export const scheduleMealCreation = () => {
  cron.schedule("0 0 1 * *", async () => {
    console.log("Running meal creation cron job for upcoming month");

    try {
      const messes = await MessModel.find({
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
        const users = await UserModel.find({
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
                    { type: MealType.Breakfast, isActive: true },
                    { type: MealType.Lunch, isActive: true },
                    { type: MealType.Dinner, isActive: true },
                  ],
                },
              },
            });
          }
        }

        if (bulkOps.length > 0) {
          await MealModel.bulkWrite(bulkOps, { ordered: false });
          console.log(
            `Created meals for mess ${mess.messId} for ${users.length} users`
          );
        }
      }
    } catch (err) {
      console.error("Meal creation cron job failed:", err);
    }
  });
};
