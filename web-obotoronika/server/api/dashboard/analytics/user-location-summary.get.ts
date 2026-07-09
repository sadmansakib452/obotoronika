import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const days = parseInt(query.last as string) || 7 // Default: last 7 days

  const { data, error } = await supabaseAdmin.rpc('get_city_counts_range', {
    days_ago: days,
  })

  if (error) {
    console.error('Supabase error:', error.message)
    return { success: false, error: error.message }
  }

  const cityCounts = (data || []).reduce((acc: Record<string, number>, row: { city: string, count: number }) => {
    const city = row.city?.trim()
    if (!city) return acc
    acc[city] = row.count
    return acc
  }, {} as Record<string, number>)

  return {
    success: true,
    data: cityCounts,
  }
})
