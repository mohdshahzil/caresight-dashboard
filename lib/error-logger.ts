/**
 * Error logging utility that only logs in development mode
 */

export interface ErrorLogContext {
  component?: string
  action?: string
  userId?: string
  metadata?: Record<string, any>
}

export class ErrorLogger {
  private static get isDev() {
    return process.env.NODE_ENV === 'development'
  }

  /**
   * Log an error with context - only in development
   */
  static error(error: Error | string, context?: ErrorLogContext): void {
    if (!ErrorLogger.isDev) return

    const errorMessage = error instanceof Error ? error.message : error
    const errorStack = error instanceof Error ? error.stack : undefined

    console.group('🚨 Error Log')
    console.error('Message:', errorMessage)
    
    if (errorStack) {
      console.error('Stack:', errorStack)
    }

    if (context) {
      console.error('Context:', context)
    }

    console.groupEnd()
  }

  /**
   * Log a warning with context - only in development
   */
  static warn(message: string, context?: ErrorLogContext): void {
    if (!ErrorLogger.isDev) return

    console.group('⚠️ Warning Log')
    console.warn('Message:', message)
    
    if (context) {
      console.warn('Context:', context)
    }

    console.groupEnd()
  }

  /**
   * Log debug information - only in development
   */
  static debug(message: string, data?: any): void {
    if (!ErrorLogger.isDev) return

    console.group('🐛 Debug Log')
    console.log('Message:', message)
    
    if (data !== undefined) {
      console.log('Data:', data)
    }

    console.groupEnd()
  }

  /**
   * Log API responses for debugging - only in development
   */
  static apiResponse(url: string, response: any, context?: ErrorLogContext): void {
    if (!ErrorLogger.isDev) return

    console.group('🌐 API Response Log')
    console.log('URL:', url)
    console.log('Response:', response)
    
    if (context) {
      console.log('Context:', context)
    }

    console.groupEnd()
  }
}

/**
 * Convenience functions for cleaner imports
 */
export const logError = ErrorLogger.error
export const logWarn = ErrorLogger.warn
export const logDebug = ErrorLogger.debug
export const logApiResponse = ErrorLogger.apiResponse
