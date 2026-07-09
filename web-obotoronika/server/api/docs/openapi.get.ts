import { errorResponse } from '../../utils/response'
import { buildOpenApiSpec } from '../../docs/openapi'

export default defineEventHandler((event) => {
  if (process.env.NODE_ENV === 'production') {
    return errorResponse(event, 404, 'Not Found')
  }

  const spec = buildOpenApiSpec()
  setResponseStatus(event, 200)
  return spec
})
