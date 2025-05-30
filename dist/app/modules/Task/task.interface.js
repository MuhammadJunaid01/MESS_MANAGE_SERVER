"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Urgency = exports.TaskType = void 0;
// Enum for task types
var TaskType;
(function (TaskType) {
    TaskType["GroceryBuyer"] = "GroceryBuyer";
    TaskType["UtilityManager"] = "UtilityManager";
    TaskType["MealManager"] = "MealManager";
})(TaskType || (exports.TaskType = TaskType = {}));
// Enum for urgency levels
var Urgency;
(function (Urgency) {
    Urgency["Low"] = "low";
    Urgency["Medium"] = "medium";
    Urgency["High"] = "high";
    Urgency["Critical"] = "critical";
})(Urgency || (exports.Urgency = Urgency = {}));
