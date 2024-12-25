import { supabase } from "@/integrations/supabase/client";
import { FormData } from "@/utils/validation";

export async function checkExistingUser(prn: string) {
  const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('prn')
    .eq('prn', prn.toUpperCase())
    .maybeSingle();

  return { existingUser, checkError };
}

export async function registerUser(values: FormData) {
  // Format PRN to uppercase and create email
  const prn = values.prn.toUpperCase();
  const email = `${prn}@pccoe.org`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password: values.password,
    options: {
      data: {
        name: values.name,
        prn: prn, // Store uppercase PRN
        branch: values.branch,
        year: values.year,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}