import { Types } from "mongoose";
import { z } from "zod";

// Enum schemas
const UserRoleSchema = z.enum([
  "Admin",
  "Member",
  "Buyer",
  "UtilityManager",
  "MealManager",
  "Viewer",
]);

const TransactionTypeSchema = z.enum(["credit", "debit"]);

// Transaction schema
const TransactionSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  amount: z.number().positive("Amount must be positive"),
  type: TransactionTypeSchema,
  description: z.string().min(1, "Description is required"),
});

// User schema
const UserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  address: z.string().max(200, "Address is too long").optional(),
  profilePicture: z.string().url("Invalid URL format").optional(),
  nid: z
    .string()
    .regex(/^\d{10,17}$/, "Invalid NID format")
    .optional(),
  role: UserRoleSchema,
  messId: z
    .string()
    .refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid ObjectId format for messId",
    })
    .optional(),
  balance: z.number().min(0, "Balance cannot be negative").optional(),
  isVerified: z.boolean(),
  isBlocked: z.boolean(),
  isApproved: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  payToMess: z.number().min(0, "Pay to mess cannot be negative"),
  receiveFromMess: z.number().min(0, "Receive from mess cannot be negative"),
  transactionHistory: z.array(TransactionSchema).optional(),
});

// Export schemas for validation
export { TransactionSchema, UserSchema };
const signUpSchema = z.object({
  body: UserSchema,
});
export default signUpSchema;
