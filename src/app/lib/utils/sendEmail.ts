import crypto from "crypto";
import nodemailer from "nodemailer";
import config from "../../config";
import { generateOtpEmailHtml } from "../builder/html";

// Updated sendOtpEmail function
export const sendOtpEmail = async (
  email: string,
  otp: string,
  name: string,
  expiryTime: string = "10 minutes"
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: config.nodeEnv === "production",
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
  });

  const mailOptions = {
    from: config.emailUser,
    to: email,
    subject: "Verify Your Email - LifeSaver",
    html: generateOtpEmailHtml(name, otp, email, expiryTime),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully to:", email);
  } catch (err) {
    console.error("Error sending OTP:", err);
    throw new Error("Failed to send OTP");
  }
};
export const generateOtp = (): string => {
  // Generate a 3-byte buffer and convert it to a hexadecimal string
  const otpBuffer = crypto.randomBytes(3); // 3 bytes = 24 bits = 6 hex digits
  const otpHex = otpBuffer.toString("hex");

  // Convert the hexadecimal string to a decimal number
  const otpDecimal = parseInt(otpHex, 16);

  // Ensure the OTP is 6 digits by taking the modulus with 1000000
  const otp = otpDecimal % 1000000;

  // Pad the OTP with leading zeros if necessary
  return otp.toString().padStart(6, "0");
};
