import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

// Updated PRN validation to accept lowercase letters
const prnSchema = z
  .string()
  .regex(
    /^\d{3}[A-Za-z]\d[A-Za-z]\d{3}$/,
    "PRN must be in the format '122B1D066' (3 digits, letter, digit, letter, 3 digits)"
  )
  .transform(val => val.toUpperCase());

const formSchema = z.object({
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

export function RegisterForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      prn: "",
      branch: "",
      year: "1st",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // First check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('prn')
        .eq('prn', values.prn)
        .maybeSingle();

      if (existingUser) {
        toast.error("A user with this PRN already exists");
        return;
      }

      // Proceed with registration using PRN as username
      const { data, error } = await supabase.auth.signUp({
        email: values.prn,
        password: values.password,
        options: {
          data: {
            name: values.name,
            prn: values.prn,
            branch: values.branch,
            year: values.year,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        if (error.message.includes("rate limit")) {
          toast.error("Too many attempts. Please try again later.");
        } else if (error.message.includes("invalid")) {
          toast.error("Invalid PRN format. Please check and try again.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success(
        "Registration successful! Please check your email to verify your account.",
        {
          duration: 6000,
        }
      );
      
      // Clear the form
      form.reset();
      
    } catch (error) {
      toast.error("An error occurred during registration");
      console.error("Registration error:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PRN Number</FormLabel>
              <FormControl>
                <Input placeholder="122B1D066" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Computer Engineering" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1st">1st Year</SelectItem>
                  <SelectItem value="2nd">2nd Year</SelectItem>
                  <SelectItem value="3rd">3rd Year</SelectItem>
                  <SelectItem value="4th">4th Year</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">Register</Button>
      </form>
    </Form>
  );
}
