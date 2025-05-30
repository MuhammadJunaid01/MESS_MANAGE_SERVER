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
exports.generateOtp = exports.sendOtpEmail = void 0;
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../config"));
const html_1 = require("../builder/html");
// Updated sendOtpEmail function
const sendOtpEmail = (email_1, otp_1, name_1, ...args_1) => __awaiter(void 0, [email_1, otp_1, name_1, ...args_1], void 0, function* (email, otp, name, expiryTime = "10 minutes") {
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: config_1.default.nodeEnv === "production",
        auth: {
            user: "hire.developerjunaid@gmail.com",
            pass: "htzg ivoj sahv irad",
        },
    });
    const mailOptions = {
        from: "hire.developerjunaid@gmail.com",
        to: email,
        subject: "Verify Your Email - LifeSaver",
        html: (0, html_1.generateOtpEmailHtml)(name, otp, email, expiryTime),
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log("OTP email sent successfully to:", email);
    }
    catch (err) {
        console.error("Error sending OTP:", err);
        throw new Error("Failed to send OTP");
    }
});
exports.sendOtpEmail = sendOtpEmail;
const generateOtp = () => {
    // Generate a 3-byte buffer and convert it to a hexadecimal string
    const otpBuffer = crypto_1.default.randomBytes(3); // 3 bytes = 24 bits = 6 hex digits
    const otpHex = otpBuffer.toString("hex");
    // Convert the hexadecimal string to a decimal number
    const otpDecimal = parseInt(otpHex, 16);
    // Ensure the OTP is 6 digits by taking the modulus with 1000000
    const otp = otpDecimal % 1000000;
    // Pad the OTP with leading zeros if necessary
    return otp.toString().padStart(6, "0");
};
exports.generateOtp = generateOtp;
