declare global {
  interface Window {
    __visitorLogged?: boolean
  }
}

interface GeoData {
  ip: string
  country: string
  region: string
  city: string
  latitude: number
  longitude: number
}

function safeRandomUUID(): string {
  const c = (globalThis as any)?.crypto as Crypto | undefined
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()
  if (c && typeof c.getRandomValues === 'function') {
    // RFC4122 v4 fallback
    const bytes = new Uint8Array(16)
    c.getRandomValues(bytes)
    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80
    const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }
  // last-resort (non-crypto) fallback
  return `sid_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

const logVisitor = async (to: any) => {
  if (import.meta.server) return
  console.log('log middleware')
  if (window.__visitorLogged) return

  window.__visitorLogged = true

  const sessionId
    = localStorage.getItem('session_id') || safeRandomUUID()
  localStorage.setItem('session_id', sessionId)

  try {
    const geo: GeoData = await $fetch('/api/geo/ip')
    await $fetch('/api/visitor-log', {
      method: 'POST',
      body: {
        ip: geo.ip,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        latitude: geo.latitude,
        longitude: geo.longitude,
        pageVisited: to.fullPath,
        deviceType: /Mobi|Android/i.test(navigator.userAgent)
          ? 'mobile'
          : 'desktop',
        sessionId,
      },
    })
  }
  catch (err) {
    // Visitor logging is best-effort; third-party geo IP services may block requests.
  }
}

export default logVisitor
