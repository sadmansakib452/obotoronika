import { createClient } from '@supabase/supabase-js'

const config = useRuntimeConfig()

const supabaseAdmin = createClient(
  config.supabaseURL,
  config.supabaseRoleKey,
)

export default supabaseAdmin
