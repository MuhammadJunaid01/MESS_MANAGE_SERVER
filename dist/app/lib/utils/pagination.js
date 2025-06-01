"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationMeta = exports.getPaginationParams = void 0;
const errors_1 = require("../../middlewares/errors");
const getPaginationParams = (query) => {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    if (isNaN(page) || page < 1) {
        throw new errors_1.AppError("Page must be a positive integer", 400, "INVALID_PAGE");
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
        throw new errors_1.AppError("Limit must be a positive integer between 1 and 100", 400, "INVALID_LIMIT");
    }
    return { page, limit };
};
exports.getPaginationParams = getPaginationParams;
const getPaginationMeta = (total, page, limit) => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
});
exports.getPaginationMeta = getPaginationMeta;
