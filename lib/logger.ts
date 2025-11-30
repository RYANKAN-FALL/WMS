/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/logger.ts - Simple logging utility
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  meta?: any;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep only last 1000 logs in memory

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private addLog(level: LogEntry['level'], message: string, meta?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
    };

    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In development, also log to console
    if (process.env.NODE_ENV !== 'production') {
      console[level](logEntry.timestamp, `[${level.toUpperCase()}]`, message, meta || '');
    }

    // In production, you might want to send logs to an external service
    if (process.env.NODE_ENV === 'production') {
      // Here you could send logs to an external service like Sentry, LogRocket, etc.
      // For now, we'll just keep them in memory
      this.sendToExternalService(logEntry);
    }
  }

  private sendToExternalService(logEntry: LogEntry): void {
    // In a real application, you would send logs to an external service
    // For example, Sentry, LogRocket, or a custom logging API
    // This is a placeholder implementation
    console.log('Sending log to external service:', logEntry);
  }

  info(message: string, meta?: any): void {
    this.addLog('info', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.addLog('warn', message, meta);
  }

  error(message: string, meta?: any): void {
    this.addLog('error', message, meta);
  }

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      this.addLog('debug', message, meta);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs]; // Return a copy
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export default Logger.getInstance();
