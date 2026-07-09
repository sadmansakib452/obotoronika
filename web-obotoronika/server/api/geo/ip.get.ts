export default defineEventHandler(async () => {
  try {
    const res = await fetch('https://ipwho.is/')
    if (!res.ok) throw new Error(`ipwho.is returned ${res.status}`)
    return res.json()
  }
  catch (error: any) {
    console.error('[geo-ip] ipwho.is fetch failed:', error.message)
    // Return fallback so visitor logging still works
    return {
      ip: 'unknown',
      country: 'Unknown',
      region: '',
      city: '',
      latitude: 0,
      longitude: 0,
    }
  }
})
