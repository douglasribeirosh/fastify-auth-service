import type { LogLevel } from '../../types/shared/logger'

// noinspection JSUnusedGlobalSymbols
enum LogLevels {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FAZTAL = 'fatal',
  SILENT = 'silent',
}

const logLevels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']

export { LogLevels, logLevels }
