
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

export const recoveryEmailSchema = z
  .string()
  .email("Invalid recovery email address")
  .refine(
    (email) => !email.endsWith("@pccoepune.org"),
    "Recovery email should be different from your college email"
  );

export const formSchema = z.object({
  role: z.enum(["student", "professor"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  recoveryEmail: z.string().optional(),
  prn: z.string().min(7, "PRN must be at least 7 characters").max(20, "PRN is too long"),
  branch: z.string().min(2, "Branch is required"),
  year: z.string().optional(),
  password: passwordSchema,
  confirmPassword: z.string(),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => {
    const localPart = data.email.split("@")[0] ?? "";
    const hasDigit = /\d/.test(localPart);
    if (data.role === "student") return hasDigit;
    return !hasDigit;
  }, {
    message:
      "Email format does not match the selected role. Students: name.surname[year]@pccoepune.org. Professors: name.surname@pccoepune.org (no digits).",
    path: ["email"],
  })
  .refine((data) => {
    if (data.role !== "student") return true;
    return !!data.year && data.year.length > 0;
  }, { message: "Year is required for students", path: ["year"] })
  .refine((data) => {
    if (data.role !== "student") return true;
    if (!data.recoveryEmail) return false;
    const parsed = recoveryEmailSchema.safeParse(data.recoveryEmail);
    return parsed.success;
  }, {
    message:
      "Recovery email is required and must be different from your college email",
    path: ["recoveryEmail"],
  });

export type FormData = z.infer<typeof formSchema>;
