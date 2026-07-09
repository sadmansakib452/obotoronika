import { z } from 'zod'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

const querySchema = z.object({
  last: z
    .string()
    .default('10')
    .transform(val => parseInt(val, 10))
    .nullable(),
})

export default defineEventHandler(async (event) => {
  const supabase = await getServerSupabase(event)
  await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

  const config = useRuntimeConfig()

  const zoneId = config.CLOUDFLARE_ZONE_ID
  const apiUrl = `https://api.cloudflare.com/client/v4/graphql`

  const queryObj: any = await getValidatedQuery(event, query =>
    querySchema.safeParse(query),
  )

  const query = `
    query {
      viewer {
        zones(filter: { zoneTag: "${zoneId}" }) {
          httpRequests1dGroups(limit: 30, filter: { date_gt: "${
            new Date(
              new Date().setDate(new Date().getDate() - queryObj.data.last),
            )
              .toISOString()
              .split('T')[0]
          }" }) {
            dimensions {
              date
            }
            sum {
              requests
              bytes
              cachedBytes
              cachedRequests
              threats
              pageViews
            }
          }
        }
      }
    }
  `

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`Error fetching analytics data: ${response.statusText}`)
    }

    const data = await response.json()
    const groups = data?.data?.viewer?.zones?.[0]?.httpRequests1dGroups
    if (!groups || !Array.isArray(groups)) {
      return successResponse(event, 200, [])
    }
    return successResponse(event, 200, groups)
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.error('[cloudflare-analytics] Error:', error?.message || error)
    return errorResponse(event, 502, 'CloudFlare analytics unavailable')
  }
})
