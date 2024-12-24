import { supabase } from "@/integrations/supabase/client";
import { FormData } from "@/utils/validation";

export async function checkExistingUser(prn: string) {
  const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('prn')
    .eq('prn', prn)
    .maybeSingle();

  return { existingUser, checkError };
}

export async function registerUser(values: FormData) {
  const email = `${values.prn.toUpperCase()}@pccoe.org`;

  const { data, error } = await supabase.auth.signUp({
    email,
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

  return { data, error };
}