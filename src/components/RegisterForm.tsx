
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormData, formSchema } from "@/utils/validation";
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
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      recoveryEmail: "",
      prn: "",
      branch: "",
      year: "1st",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    try {
      const { error } = await signUp(
        values.email,
        values.password,
        {
          name: values.name,
          prn: values.prn,
          branch: values.branch,
          year: values.year,
          recoveryEmail: values.recoveryEmail,
        }
      );
      
      if (error) {
        toast.error(error.message || "Registration failed");
        return;
      }
      
      toast.success("Registration successful! Please check your email to confirm your account.", {
        duration: 6000,
      });
      form.reset();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
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
                <Input placeholder="John Doe" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PCCOE Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="student@pccoepune.org" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recoveryEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recovery Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="your-personal-email@example.com" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                This email will be used to recover your account after graduation when you no longer have access to your PCCOE email.
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PRN (Permanent Registration Number)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., 12345678900" 
                  {...field} 
                  disabled={isLoading}
                />
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
                <Input placeholder="e.g., Computer Engineering" {...field} disabled={isLoading} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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
                <Input type="password" placeholder="Enter your password" {...field} disabled={isLoading} />
              </FormControl>
              <PasswordStrengthIndicator password={field.value} />
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
                <Input type="password" placeholder="Confirm your password" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </Button>
      </form>
    </Form>
  );
}
