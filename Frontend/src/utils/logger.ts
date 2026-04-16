import fs from 'fs'
import path from 'path'

/**
 * Server-side file logger for Next.js — similar to Laravel's storage/logs/
 *
 * Writes to Frontend/logs/app.log and Frontend/logs/error.log
 * with daily date prefixes and structured format.
 *
 * Usage in server components / API routes / middleware:
 *   import { logger } from '@/utils/logger'
 *   logger.info('User signed in', { userId: '...' })
 *   logger.error('Payment failed', { orderId: '...' })
 *
 * NOTE: This only works on the server side (Node.js). For client-side
 *       errors, use the browser console or a service like Sentry.
 */

const LOG_DIR = path.join(process.cwd(), 'logs')

// Ensure log directory exists
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }
} catch {
  // Silently fail if we can't create the dir (e.g., read-only filesystem)
}

type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'

function getDateStr(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

function getTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').replace('Z', '')
}

function formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
  const timestamp = getTimestamp()
  const contextStr = context ? ` ${JSON.stringify(context)}` : ''

  return `[${timestamp}] ${level} — ${message}${contextStr}\n`
}

function writeLog(filename: string, content: string): void {
  try {
    const dateStr = getDateStr()
    const logFile = path.join(LOG_DIR, `${filename}-${dateStr}.log`)

    fs.appendFileSync(logFile, content, 'utf-8')
  } catch {
    // Fall back to console if file write fails
    process.stderr.write(content)
  }
}

function cleanOldLogs(filename: string, keepDays: number): void {
  try {
    const files = fs.readdirSync(LOG_DIR).filter(f => f.startsWith(filename) && f.endsWith('.log'))
    const cutoff = Date.now() - keepDays * 24 * 60 * 60 * 1000

    for (const file of files) {
      const filePath = path.join(LOG_DIR, file)
      const stat = fs.statSync(filePath)

      if (stat.mtimeMs < cutoff) {
        fs.unlinkSync(filePath)
      }
    }
  } catch {
    // Ignore cleanup errors
  }
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    const line = formatMessage('DEBUG', message, context)

    writeLog('app', line)
    process.stdout.write(line)
  },

  info(message: string, context?: Record<string, unknown>) {
    const line = formatMessage('INFO', message, context)

    writeLog('app', line)
    process.stdout.write(line)
  },

  warning(message: string, context?: Record<string, unknown>) {
    const line = formatMessage('WARNING', message, context)

    writeLog('app', line)
    writeLog('error', line)
    process.stderr.write(line)
  },

  error(message: string, context?: Record<string, unknown>) {
    const line = formatMessage('ERROR', message, context)

    writeLog('app', line)
    writeLog('error', line)
    process.stderr.write(line)
  },

  critical(message: string, context?: Record<string, unknown>) {
    const line = formatMessage('CRITICAL', message, context)

    writeLog('app', line)
    writeLog('error', line)
    process.stderr.write(line)
  },

  /** Remove log files older than `days`. Call on app startup. */
  cleanup(days: number = 30) {
    cleanOldLogs('app', days)
    cleanOldLogs('error', days * 3) // Keep error logs 3x longer
  }
}
