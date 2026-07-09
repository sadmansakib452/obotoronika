import type { H3Event } from 'h3'
// Define generic interfaces for API responses
export interface ErrorResponse {
  status: number
  error: string
  message: string
}

export const errorResponse = (
  event: H3Event,
  status: number,
  customMessage?: string,
) => {
  const errorMessages: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
  }

  const defaultMessage
    = errorMessages[status] || 'An unexpected error occurred.'
  const message = customMessage || defaultMessage

  setResponseStatus(event, status)
  return {
    status,
    error: errorMessages[status] || 'Unknown Error',
    message,
  }
}

export const successResponse = <T>(
  event: H3Event,
  status: number,
  data?: T,
  customMessage?: string,
): SuccessResponse<T> => {
  const successMessages: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    204: 'No Content',
  }

  const defaultMessage = successMessages[status] || 'Success'
  const message = customMessage || defaultMessage

  setResponseStatus(event, status)

  return {
    status,
    message,
    data: data as T,
    success: true,
  }
}
