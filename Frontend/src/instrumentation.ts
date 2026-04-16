/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts. Used to initialise server-side logging.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run on the server (Node.js runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { logger } = await import('@/utils/logger')

    logger.info('Next.js server started', {
      nodeEnv: process.env.NODE_ENV,
      apiUrl: process.env.NEXT_PUBLIC_API_URL
    })

    // Clean up old log files on startup
    logger.cleanup(30)

    // Catch unhandled rejections and exceptions
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Promise Rejection', {
        reason: reason instanceof Error ? reason.stack || reason.message : String(reason)
      })
    })

    process.on('uncaughtException', (error: Error) => {
      logger.critical('Uncaught Exception', {
        message: error.message,
        stack: error.stack
      })
    })
  }
}
