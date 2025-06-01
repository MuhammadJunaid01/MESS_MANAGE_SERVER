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
exports.getNextMessId = exports.sendResponse = void 0;
const counter_schema_1 = __importDefault(require("../../modules/Counter/counter.schema"));
const sendResponse = (res, { statusCode, message, success, data, meta }) => {
    return res
        .status(statusCode)
        .json({ success, message, data, statusCode, meta });
};
exports.sendResponse = sendResponse;
const getNextMessId = () => __awaiter(void 0, void 0, void 0, function* () {
    const counter = yield counter_schema_1.default.findOneAndUpdate({ _id: "messId" }, { $inc: { sequenceValue: 1 } }, { new: true, upsert: true });
    return counter.sequenceValue;
});
exports.getNextMessId = getNextMessId;
