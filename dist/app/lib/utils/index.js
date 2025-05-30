"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, { statusCode, message, success, data }) => {
    return res.status(statusCode).json({ success, message, data, statusCode });
};
exports.sendResponse = sendResponse;
