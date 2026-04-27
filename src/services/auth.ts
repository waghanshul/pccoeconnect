
import { FormData } from "@/utils/validation";
import { supabase } from "@/integrations/supabase/client";

export async function checkExistingUser(prn: string) {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('prn', prn)
      .single();
    
    return { existingUser: data, checkError: error };
  } catch (error) {
    console.error("Error checking existing user:", error);
    return { existingUser: null, checkError: error as Error };
  }
}

export async function registerUser(values: FormData) {
  try {
    // Role is selected by user; backend trigger also derives from email format.
    // 'professor' is stored as 'admin' role in profiles table.
    const detectedRole = values.role === "professor" ? "admin" : "student";

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          name: values.name,
          prn: values.prn,
          branch: values.branch,
          year: values.year ?? null,
          recoveryEmail: values.recoveryEmail ?? null,
          role: detectedRole
        }
      }
    });

    if (authError) throw authError;

    return { 
      data: { user: authData.user }, 
      error: null 
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return { 
      data: null, 
      error: error as Error 
    };
  }
}
