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
  const formattedPrn = values.prn.toUpperCase();
  // Create a valid email format for Supabase auth while keeping PRN as identifier
  const email = `${formattedPrn.toLowerCase()}@pccoe.edu.in`;

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
