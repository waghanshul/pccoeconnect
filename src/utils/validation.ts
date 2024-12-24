import * as z from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const prnSchema = z
  .string()
  .regex(
    /^\d{3}[A-Za-z]\d[A-Za-z]\d{3}$/,
    "PRN must be in the format '122B1D066' (3 digits, letter, digit, letter, 3 digits)"
  )
  .transform(val => val.toUpperCase());

export const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  prn: prnSchema,
  branch: z.string().min(2, "Branch is required"),
  year: z.string(),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type FormData = z.infer<typeof formSchema>;