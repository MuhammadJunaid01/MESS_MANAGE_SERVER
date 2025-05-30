"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityEntity = exports.ActivityAction = void 0;
var ActivityAction;
(function (ActivityAction) {
    ActivityAction["Created"] = "created";
    ActivityAction["Updated"] = "updated";
    ActivityAction["Approved"] = "approved";
    ActivityAction["Rejected"] = "rejected";
    ActivityAction["Deleted"] = "deleted";
})(ActivityAction || (exports.ActivityAction = ActivityAction = {}));
var ActivityEntity;
(function (ActivityEntity) {
    ActivityEntity["Meal"] = "Meal";
    ActivityEntity["Expense"] = "Expense";
})(ActivityEntity || (exports.ActivityEntity = ActivityEntity = {}));
