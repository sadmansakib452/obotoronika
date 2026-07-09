import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export async function getServerSupabase(event: H3Event) {
  return await serverSupabaseClient(event)
}
