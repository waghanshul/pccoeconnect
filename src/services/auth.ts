import { supabase } from "@/integrations/supabase/client";
import { FormData } from "@/utils/validation";

export async function checkExistingUser(prn: string) {
  const formattedPrn = prn.toUpperCase();
  const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('prn')
    .eq('prn', formattedPrn)
    .maybeSingle();

  return { existingUser, checkError };
}

export async function registerUser(values: FormData) {
  // Format PRN to uppercase and create email
  const formattedPrn = values.prn.toUpperCase();
  const email = `${formattedPrn}@pccoe.org`.toLowerCase(); // Ensure email is lowercase

  const { data, error } = await supabase.auth.signUp({
    email,
    password: values.password,
    options: {
      data: {
        name: values.name,
        prn: formattedPrn,
        branch: values.branch,
        year: values.year,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}