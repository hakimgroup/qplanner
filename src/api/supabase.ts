import { createClient } from "@supabase/supabase-js";

const projectURL: string = import.meta.env.VITE_SUPABASE_URL;
const projectKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(projectURL, projectKey);
