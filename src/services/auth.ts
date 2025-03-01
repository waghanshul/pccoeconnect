
import { FormData } from "@/utils/validation";
import { authService } from "@/api/authService";

export async function checkExistingUser(prn: string) {
  const response = await authService.checkExistingUser(prn);
  return response.data || { existingUser: null, checkError: null };
}

export async function registerUser(values: FormData) {
  const response = await authService.registerUser(values);
  return response.data 
    ? { data: response.data, error: null } 
    : { data: null, error: response.error };
}
