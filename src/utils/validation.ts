
import * as z from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .regex(
    /^[a-zA-Z0-9._%+-]+@pccoepune\.org$/,
    "Please use your PCCOE email address (ending with @pccoepune.org)"
  );

export const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  prn: z.string().min(7, "PRN must be at least 7 characters").max(20, "PRN is too long"),
  branch: z.string().min(2, "Branch is required"),
  year: z.string(),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type FormData = z.infer<typeof formSchema>;
