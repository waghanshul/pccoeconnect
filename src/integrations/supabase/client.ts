// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fkocqxfvrzkrguhbulam.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrb2NxeGZ2cnprcmd1aGJ1bGFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDM3MTQsImV4cCI6MjA1NzI3OTcxNH0.0-Q64NIjZS4p_Ujfz0P4K5liVRxRJIx1bfLuLR9u39A";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);