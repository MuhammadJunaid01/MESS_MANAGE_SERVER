import { z } from "zod";
import { Gender, UserRole } from "../modules/User/user.interface";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const signUpSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    gender: z.enum(Object.values(Gender) as [string, ...string[]], {
      errorMap: () => ({ message: "Invalid gender" }),
    }),
    dateOfBirth: z.string().datetime().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
    address: z.string().optional(),
    profilePicture: z.string().url().optional(),
    nid: z
      .string()
      .regex(/^\d{10,17}$/, "Invalid NID format")
      .optional(),
    role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
    messId: z.string().regex(objectIdRegex, "Invalid mess ID").optional(),
  }),
});
export const signInSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters"),
  }),
});
export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    otp: z
      .string()
      .length(6, "OTP must be 6 digits")
      .regex(/^\d{6}$/, "OTP must be numeric"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    otp: z
      .string()
      .length(6, "OTP must be 6 digits")
      .regex(/^\d{6}$/, "OTP must be numeric"),
    resetToken: z.string().min(1, "Reset token is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
  }),
});

export const joinMessSchema = z.object({
  body: z.object({
    userId: z.string().regex(objectIdRegex, "Invalid user ID"),
    messId: z.string().regex(objectIdRegex, "Invalid mess ID"),
  }),
});

export const approveMessJoinSchema = z.object({
  params: z.object({
    userId: z.string().regex(objectIdRegex, "Invalid user ID"),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    gender: z.enum(Object.values(Gender) as [string, ...string[]], {
      errorMap: () => ({ message: "Invalid gender" }),
    }),
    dateOfBirth: z.string().datetime().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
    address: z.string().optional(),
    profilePicture: z.string().url().optional(),
    nid: z
      .string()
      .regex(/^\d{10,17}$/, "Invalid NID format")
      .optional(),
    role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
    messId: z.string().regex(objectIdRegex, "Invalid mess ID").optional(),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    userId: z.string().regex(objectIdRegex, "Invalid user ID"),
  }),
});

export const getUserByEmailSchema = z.object({
  query: z.object({
    email: z.string().email("Invalid email format"),
  }),
});

export const getUsersSchema = z.object({
  query: z.object({
    messId: z.string().regex(objectIdRegex, "Invalid mess ID").optional(),
    role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
    isVerified: z.enum(["true", "false"]).optional(),
    isBlocked: z.enum(["true", "false"]).optional(),
    isApproved: z.enum(["true", "false"]).optional(),
    limit: z.string().regex(/^\d+$/, "Limit must be a number").optional(),
    skip: z.string().regex(/^\d+$/, "Skip must be a number").optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    userId: z.string().regex(objectIdRegex, "Invalid user ID"),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    gender: z.enum(Object.values(Gender) as [string, ...string[]]).optional(),
    dateOfBirth: z.string().datetime().optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/)
      .optional(),
    address: z.string().optional(),
    profilePicture: z.string().url().optional(),
    nid: z
      .string()
      .regex(/^\d{10,17}$/)
      .optional(),
    role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
    messId: z.string().regex(objectIdRegex).optional(),
    balance: z.number().min(0).optional(),
    isVerified: z.boolean().optional(),
    isBlocked: z.boolean().optional(),
    isApproved: z.boolean().optional(),
  }),
});

export const updatePasswordSchema = z.object({
  params: z.object({
    userId: z.string().regex(objectIdRegex, "Invalid user ID"),
  }),
  body: z.object({
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
  }),
});

export const softDeleteUserSchema = z.object({
  params: z.object({
    userId: z.string().regex(objectIdRegex, "Invalid user ID"),
  }),
});

export const addActivityLogSchema = z.object({
  params: z.object({
    userId: z.string().regex(objectIdRegex, "Invalid user ID"),
  }),
  body: z.object({
    action: z.enum([
      "approved",
      "rejected",
      "blocked",
      "unblocked",
      "joined_mess",
    ]),
    performedBy: z.object({
      name: z.string().min(1, "Performer name is required"),
      managerId: z.string().regex(objectIdRegex, "Invalid manager ID"),
    }),
  }),
});
