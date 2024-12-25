import { FormData } from "@/utils/validation";

export async function checkExistingUser(prn: string) {
  // Removed Supabase check, always return no existing user
  return { existingUser: null, checkError: null };
}

export async function registerUser(values: FormData) {
  // Removed Supabase registration, just return success
  return { 
    data: { user: values }, 
    error: null 
  };
}