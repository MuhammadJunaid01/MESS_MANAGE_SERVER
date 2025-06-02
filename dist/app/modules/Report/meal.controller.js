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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMealReportController = void 0;
const utils_1 = require("../../lib/utils");
const middlewares_1 = require("../../middlewares");
const errors_1 = require("../../middlewares/errors");
const report_service_1 = require("./report.service");
// Generate meal participation report
exports.generateMealReportController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { messId, userId, dateFrom, dateTo, groupBy, limit, skip } = req.query;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const report = yield (0, report_service_1.generateMealReport)({
        messId: messId,
        userId: userId,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        groupBy: groupBy,
        limit: limit ? Number(limit) : undefined,
        skip: skip ? Number(skip) : undefined,
    }, authUser.userId);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Meal report generated successfully",
        data: { report },
    });
}));
