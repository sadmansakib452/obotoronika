import type { H3Event } from 'h3'
import { defineEventHandler, readBody } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  const req = event.node.req
  const res = event.node.res

  if (req.url && !req.url.startsWith('/api/')) {
    return
  }

  // Measure request size (body)
  let reqSize = 0
  try {
    const body = await readBody(event)
    reqSize = Buffer.byteLength(JSON.stringify(body ?? ''), 'utf8')
  }
  catch {
    // no body or error reading, ignore
  }

  // Variables to track response size
  let resSize = 0
  const originalWrite = res.write.bind(res)
  const originalEnd = res.end.bind(res)

  // Override write and end to accumulate response size
  //   @ts-ignore
  res.write = (chunk: any, encoding?: BufferEncoding, callback?: (error?: Error | null) => void): boolean => {
    if (chunk) {
      if (typeof chunk === 'string') {
        resSize += Buffer.byteLength(chunk, encoding)
      }
      else if (Buffer.isBuffer(chunk)) {
        resSize += chunk.length
      }
    }
    // @ts-ignore
    return originalWrite(chunk, encoding, callback)
  }
  // @ts-ignore
  res.end = (chunk?: any, encoding?: BufferEncoding, callback?: () => void): void => {
    if (chunk) {
      if (typeof chunk === 'string') {
        resSize += Buffer.byteLength(chunk, encoding)
      }
      else if (Buffer.isBuffer(chunk)) {
        resSize += chunk.length
      }
    }
    // @ts-ignore
    return originalEnd(chunk, encoding, callback)
  }

  // After response finishes, log bandwidth data to DB
  res.on('finish', async () => {
    try {
      const supabase = await getServerSupabase(event)

      // Adjust your checkUserRole function to your setup
      let userId: string | null = null
      try {
        const user = await checkUserRole(supabase, ['super_admin', 'admin', 'manager', 'customer', 'seller'])
        userId = user?.id ?? null
      }
      catch {
        // user not authenticated - skip or just log with null user
        userId = null
      }

      const rawIp
        = (req.headers['cf-connecting-ip'] as string)?.trim()
          || (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim()
          || req.socket.remoteAddress
          || '192.0.0.1'

      // Basic validation: accept only if non-empty and contains digits and dots/colon (IPv4 or IPv6)
      const ipAddress = rawIp && /[\d.:]/.test(rawIp) ? rawIp : null

      const method = req.method ?? 'UNKNOWN'
      const url = req.url ?? ''
      const statusCode = res.statusCode ?? 0
      const userAgent = req.headers['user-agent'] ?? null

      // Assuming supabase client to insert is supabase, change if you use different instance
      await supabaseAdmin.from('bandwidth_logs').insert({
        user_id: userId,
        ip_address: ipAddress,
        method,
        url,
        request_size_bytes: reqSize,
        response_size_bytes: resSize,
        status_code: statusCode,
        user_agent: userAgent,
      })
      // console.error(error)
    }
    catch (error) {
      console.error('Failed to log bandwidth:', error)
    }
  })

  // Let request proceed normally
})
