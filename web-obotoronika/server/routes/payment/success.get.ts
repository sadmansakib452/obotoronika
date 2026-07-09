export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    return successResponse(event, 200, body)
  }
  catch (error: any) {
    return errorResponse(event, 500, error.message)
  }
})
