
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
    // Register with Supabase Auth
    // Pass all user metadata to be used by the database trigger
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          name: values.name,
          prn: values.prn,
          branch: values.branch,
          year: values.year,
          recoveryEmail: values.recoveryEmail,
          role: 'student'
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
