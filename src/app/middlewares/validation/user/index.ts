import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(1, {
      message: "Name is required",
    }),
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({
      message: "Invalid email address",
    }),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, {
      message: "Password must be at least 6 characters long",
    }),
  role: z.enum(["Admin", "Member", "Buyer"]),
  contact: z
    .string({
      required_error: "Contact is required",
    })
    .min(10, {
      message: "Contact must be at least 10 characters long",
    }),
  address: z.string().min(10, {
    message: "Address must be at least 10 characters long",
  }),
  nid: z.string().optional(),
});

export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({
      message: "Invalid email address",
    }),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, {
      message: "Password must be at least 6 characters long",
    }),
});
