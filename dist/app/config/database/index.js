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
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("../index"));
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dbUri = index_1.default.databaseUrl;
        if (!dbUri) {
            throw new Error("Database URL is not defined.");
        }
        // Connect to MongoDB with a timeout
        yield mongoose_1.default.connect(dbUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("MongoDB Connected...");
    }
    catch (error) {
        console.error(`Error: ${error === null || error === void 0 ? void 0 : error.message}`);
        process.exit(1);
    }
});
exports.default = connectDB;
