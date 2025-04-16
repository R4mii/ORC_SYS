/**
 * Logger service for consistent error and event logging
 */

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  data?: any
}

class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []
  private isProduction = process.env.NODE_ENV === "production"
  private logToConsole = true

  private constructor() {
    // Singleton
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private createLogEntry(level: LogLevel, message: string, context?: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
    }
  }

  private logToStorage(entry: LogEntry) {
    // Store log in memory
    this.logs.push(entry)

    // Keep logs under a reasonable size
    if (this.logs.length > 1000) {
      this.logs.shift()
    }

    // In a real app, you might send logs to a service like Logtail, Sentry, etc.
    // if (this.isProduction) {
    //   // Send to external logging service
    // }

    // Log to console in development or if explicitly enabled
    if (this.logToConsole || !this.isProduction) {
      const consoleMethod =
        entry.level === "error"
          ? console.error
          : entry.level === "warn"
            ? console.warn
            : entry.level === "info"
              ? console.info
              : console.debug

      consoleMethod(
        `[${entry.level.toUpperCase()}] ${entry.timestamp} ${entry.context ? `[${entry.context}] ` : ""}${entry.message}`,
        entry.data || "",
      )
    }
  }

  debug(message: string, context?: string, data?: any) {
    const entry = this.createLogEntry("debug", message, context, data)
    this.logToStorage(entry)
  }

  info(message: string, context?: string, data?: any) {
    const entry = this.createLogEntry("info", message, context, data)
    this.logToStorage(entry)
  }

  warn(message: string, context?: string, data?: any) {
    const entry = this.createLogEntry("warn", message, context, data)
    this.logToStorage(entry)
  }

  error(message: string, context?: string, data?: any) {
    const entry = this.createLogEntry("error", message, context, data)
    this.logToStorage(entry)
  }

  getRecentLogs(level?: LogLevel, limit = 100): LogEntry[] {
    if (!level) {
      return this.logs.slice(-limit)
    }

    return this.logs.filter((log) => log.level === level).slice(-limit)
  }

  // For API routes - generate standardized error responses
  formatErrorResponse(error: any, status = 500) {
    this.error(error instanceof Error ? error.message : String(error), "API", {
      stack: error instanceof Error ? error.stack : undefined,
    })

    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      status,
      timestamp: new Date().toISOString(),
    }
  }
}

export const logger = Logger.getInstance()
