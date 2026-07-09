export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const days = parseInt(query.days as string) || 30

    // Validate days (optional)
    if (days <= 0) {
      throw new Error('Invalid days parameter')
    }

    // Call Postgres function with dynamic days
    const { data, error } = await supabaseAdmin.rpc('get_bandwidth_last_n_days', { p_days: days })

    if (error) throw new Error(error.message)

    // Sum total bytes over returned days
    const totalBytes = data.reduce((sum: number, day: any) => sum + (day.total_bytes ?? 0), 0)

    const totalGB = totalBytes / (1024 ** 3)

    const alert = totalGB > 3

    return {
      data,
      totalGB,
      alert,
    }
  }
  catch (error: any) {
    console.error('Error fetching bandwidth usage:', error)
    return {
      error: error.message || 'Internal Server Error',
    }
  }
})
