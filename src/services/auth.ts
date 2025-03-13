
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
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });

    if (authError) throw authError;

    if (authData.user) {
      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: values.email,
          full_name: values.name,
          role: 'student',
        });

      if (profileError) throw profileError;

      // Create student profile record
      const { error: studentProfileError } = await supabase
        .from('student_profiles')
        .insert({
          id: authData.user.id,
          prn: values.prn,
          branch: values.branch,
          year: values.year,
          recovery_email: values.email, // Using same email as recovery for now
        });

      if (studentProfileError) throw studentProfileError;
    }

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
