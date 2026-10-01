import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

// Service role client for admin operations bypasses RLS.
// Used carefully and ONLY where necessary.
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// A helper to create a client that acts on behalf of the user given their JWT.
export function createAuthClient(token: string) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
}
