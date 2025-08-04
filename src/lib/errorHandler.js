// utils/errorHandler.js
export const handleApiError = error => {
  const defaultMessage = 'An unexpected error occurred. Please try again later.'

  const errorMessages = {
    400: 'Invalid request. Please check your input.',
    401: 'Unauthorized. Please log in again.',
    403: 'Access forbidden.',
    404: 'Resource not found.',
    408: 'Request timeout. Please try again.',
    500: 'Server error. Please try again later.'
  }

  return {
    message: error.message || errorMessages[error.status] || defaultMessage,
    status: error.status || 500,
    context: error.context || 'Something went wrong'
  }
}
